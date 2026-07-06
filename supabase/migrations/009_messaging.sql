-- Real-time messaging: conversations, messages, read tracking

create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  buyer_id uuid  null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (property_id, buyer_id)
);

create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  attachment_url text,
  attachment_name text,
  attachment_type text check (attachment_type is null or attachment_type in ('image', 'file')),
  created_at timestamptz not null default now(),
  constraint messages_has_content check (
    (content is not null and length(trim(content)) > 0)
    or attachment_url is not null
  )
);

create index if not exists idx_conversations_buyer_id on public.conversations(buyer_id);
create index if not exists idx_conversations_seller_id on public.conversations(seller_id);
create index if not exists idx_conversations_last_message_at on public.conversations(last_message_at desc nulls last);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id, created_at asc);
create index if not exists idx_messages_created_at on public.messages(created_at desc);

-- Keep conversation preview in sync
create or replace function public.sync_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_text = coalesce(
      nullif(trim(new.content), ''),
      case
        when new.attachment_type = 'image' then '📷 Image'
        when new.attachment_type = 'file' then '📎 ' || coalesce(new.attachment_name, 'File')
        else 'Message'
      end
    ),
    last_message_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists trg_sync_conversation_last_message on public.messages;
create trigger trg_sync_conversation_last_message
  after insert on public.messages
  for each row execute function public.sync_conversation_last_message();

-- Seed conversations from authenticated contact inquiries
create or replace function public.create_conversation_from_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_conversation_id uuid;
begin
  if new.sender_id is null then
    return new;
  end if;

  select owner_id into v_seller_id
  from public.properties
  where id = new.property_id;

  if v_seller_id is null or v_seller_id = new.sender_id then
    return new;
  end if;

  insert into public.conversations (
    property_id,
    buyer_id,
    seller_id,
    last_message_text,
    last_message_at
  )
  values (
    new.property_id,
    new.sender_id,
    v_seller_id,
    new.message,
    new.created_at
  )
  on conflict (property_id, buyer_id) do update
  set
    last_message_text = excluded.last_message_text,
    last_message_at = excluded.last_message_at
  returning id into v_conversation_id;

  if v_conversation_id is null then
    select id into v_conversation_id
    from public.conversations
    where property_id = new.property_id
      and buyer_id = new.sender_id;
  end if;

  insert into public.messages (conversation_id, sender_id, content, created_at)
  values (v_conversation_id, new.sender_id, new.message, new.created_at);

  return new;
end;
$$;

drop trigger if exists trg_contact_inquiry_to_conversation on public.contact_inquiries;
create trigger trg_contact_inquiry_to_conversation
  after insert on public.contact_inquiries
  for each row execute function public.create_conversation_from_inquiry();

-- Backfill existing inquiries
insert into public.conversations (property_id, buyer_id, seller_id, last_message_text, last_message_at, created_at)
select
  ci.property_id,
  ci.sender_id,
  p.owner_id,
  ci.message,
  ci.created_at,
  ci.created_at
from public.contact_inquiries ci
join public.properties p on p.id = ci.property_id
where ci.sender_id is not null
  and p.owner_id <> ci.sender_id
on conflict (property_id, buyer_id) do nothing;

insert into public.messages (conversation_id, sender_id, content, created_at)
select
  c.id,
  ci.sender_id,
  ci.message,
  ci.created_at
from public.contact_inquiries ci
join public.conversations c
  on c.property_id = ci.property_id
 and c.buyer_id = ci.sender_id
where ci.sender_id is not null
  and not exists (
    select 1
    from public.messages m
    where m.conversation_id = c.id
      and m.sender_id = ci.sender_id
      and m.content = ci.message
      and m.created_at = ci.created_at
  );

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants can view read state" on public.conversation_reads;
create policy "Participants can view read state"
  on public.conversation_reads for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_reads.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants can upsert own read state" on public.conversation_reads;
create policy "Participants can upsert own read state"
  on public.conversation_reads for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_reads.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Message attachments storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-attachments',
  'message-attachments',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Message attachments are publicly accessible" on storage.objects;
create policy "Message attachments are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'message-attachments');

drop policy if exists "Participants can upload message attachments" on storage.objects;
create policy "Participants can upload message attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own message attachments" on storage.objects;
create policy "Users can delete own message attachments"
  on storage.objects for delete
  using (
    bucket_id = 'message-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Realtime
alter table public.messages replica identity full;
alter table public.conversations replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
    alter publication supabase_realtime add table public.conversations;
    alter publication supabase_realtime add table public.conversation_reads;
  end if;
exception
  when duplicate_object then null;
end $$;
