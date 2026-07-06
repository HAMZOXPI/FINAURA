-- Seller identity verification flag (document-based approval)
alter table public.profiles add column if not exists is_verified boolean not null default false;

do $$ begin
  create type public.verification_request_status as enum (
    'pending',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.verification_requests (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  status public.verification_request_status not null default 'pending',
  rejection_reason text,
  id_front text not null,
  id_back text not null,
  selfie text not null,
  proof_of_address text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create index if not exists idx_verification_requests_seller_id
  on public.verification_requests(seller_id);

create index if not exists idx_verification_requests_status
  on public.verification_requests(status);

create index if not exists idx_verification_requests_seller_created
  on public.verification_requests(seller_id, created_at desc);

-- One pending request per seller
create unique index if not exists idx_verification_requests_one_pending
  on public.verification_requests(seller_id)
  where status = 'pending';

-- Approve seller when request is approved
create or replace function public.handle_verification_request_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.reviewed_at := coalesce(new.reviewed_at, now());

    update public.profiles
    set
      is_verified = true,
      verified_seller = true,
      identity_verified = true
    where id = new.seller_id;
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.reviewed_at := coalesce(new.reviewed_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_verification_request_review on public.verification_requests;
create trigger trg_verification_request_review
  before update of status on public.verification_requests
  for each row execute function public.handle_verification_request_review();

alter table public.verification_requests enable row level security;

drop policy if exists "Sellers can view own verification requests" on public.verification_requests;
create policy "Sellers can view own verification requests"
  on public.verification_requests for select
  using (
    auth.uid() = seller_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Sellers can submit verification requests" on public.verification_requests;
create policy "Sellers can submit verification requests"
  on public.verification_requests for insert
  with check (
    auth.uid() = seller_id
    and status = 'pending'
    and not exists (
      select 1 from public.verification_requests vr
      where vr.seller_id = auth.uid() and vr.status = 'pending'
    )
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_verified = true
    )
  );

drop policy if exists "Admins can update verification requests" on public.verification_requests;
create policy "Admins can update verification requests"
  on public.verification_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Private storage for verification documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-documents',
  'verification-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Sellers can upload own verification documents" on storage.objects;
create policy "Sellers can upload own verification documents"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers can read own verification documents" on storage.objects;
create policy "Sellers can read own verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

drop policy if exists "Admins can manage verification documents" on storage.objects;
create policy "Admins can manage verification documents"
  on storage.objects for all
  using (
    bucket_id = 'verification-documents'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'verification-documents'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
