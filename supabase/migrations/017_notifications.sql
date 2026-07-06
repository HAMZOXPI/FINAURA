-- In-app notification system

do $$ begin
  create type public.notification_priority as enum (
    'info',
    'success',
    'warning',
    'error'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum (
    'verification_approved',
    'verification_rejected',
    'property_approved',
    'property_rejected',
    'property_hidden',
    'premium_activated',
    'premium_expired',
    'gift_granted',
    'payment_confirmed',
    'subscription_changed',
    'new_message',
    'report_listing',
    'admin_broadcast',
    'system'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_audience as enum (
    'all_users',
    'premium_users',
    'verified_users',
    'single_user'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_audit_action as enum (
    'create',
    'read',
    'read_all',
    'delete',
    'broadcast'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notification_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  notification_type public.notification_type not null default 'admin_broadcast',
  priority public.notification_priority not null default 'info',
  audience public.notification_audience not null,
  target_user_id uuid references public.profiles(id) on delete set null,
  template_key text,
  sent_by uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  recipient_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type public.notification_type not null,
  priority public.notification_priority not null default 'info',
  title text not null,
  body text not null,
  action_url text,
  template_key text,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  broadcast_id uuid references public.notification_broadcasts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_audit_log (
  id uuid primary key default uuid_generate_v4(),
  action public.notification_audit_action not null,
  notification_id uuid references public.notifications(id) on delete set null,
  broadcast_id uuid references public.notification_broadcasts(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;
create index if not exists idx_notifications_type on public.notifications(notification_type);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notification_broadcasts_created_at on public.notification_broadcasts(created_at desc);
create index if not exists idx_notification_audit_log_created_at on public.notification_audit_log(created_at desc);

drop trigger if exists notifications_updated_at on public.notifications;
create trigger notifications_updated_at
  before update on public.notifications
  for each row execute function public.update_updated_at();

alter table public.notifications enable row level security;
alter table public.notification_broadcasts enable row level security;
alter table public.notification_audit_log enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Service insert notifications" on public.notifications;
create policy "Admins insert notifications"
  on public.notifications for insert
  with check (public.is_admin());

create or replace function public.create_user_notification(
  p_user_id uuid,
  p_notification_type public.notification_type,
  p_priority public.notification_priority,
  p_title text,
  p_body text,
  p_action_url text default null,
  p_template_key text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_broadcast_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (
    user_id,
    notification_type,
    priority,
    title,
    body,
    action_url,
    template_key,
    metadata,
    broadcast_id
  ) values (
    p_user_id,
    p_notification_type,
    p_priority,
    p_title,
    p_body,
    p_action_url,
    p_template_key,
    coalesce(p_metadata, '{}'::jsonb),
    p_broadcast_id
  )
  returning id into v_id;

  insert into public.notification_audit_log (action, notification_id, user_id, metadata)
  values ('create', v_id, p_user_id, coalesce(p_metadata, '{}'::jsonb));

  return v_id;
end;
$$;

grant execute on function public.create_user_notification to authenticated;
grant execute on function public.create_user_notification to service_role;

drop policy if exists "Admins read all notifications" on public.notifications;
create policy "Admins read all notifications"
  on public.notifications for select
  using (public.is_admin());

drop policy if exists "Admins read broadcasts" on public.notification_broadcasts;
create policy "Admins read broadcasts"
  on public.notification_broadcasts for select
  using (public.is_admin());

drop policy if exists "Admins insert broadcasts" on public.notification_broadcasts;
create policy "Admins insert broadcasts"
  on public.notification_broadcasts for insert
  with check (public.is_admin());

drop policy if exists "Admins read notification audit log" on public.notification_audit_log;
create policy "Admins read notification audit log"
  on public.notification_audit_log for select
  using (public.is_admin());

drop policy if exists "Insert notification audit log" on public.notification_audit_log;
create policy "Insert notification audit log"
  on public.notification_audit_log for insert
  with check (auth.uid() is not null or public.is_admin());

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when duplicate_object then null;
end $$;
