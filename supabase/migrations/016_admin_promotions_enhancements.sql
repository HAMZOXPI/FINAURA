-- Promotions module enhancements: new gift types, payment source, audit log

alter type public.admin_gift_type add value if not exists 'premium_extension';
alter type public.admin_gift_type add value if not exists 'custom_gift';

do $$ begin
  create type public.admin_gift_payment_source as enum (
    'gift',
    'cash',
    'bank_transfer',
    'admin_compensation',
    'promotion',
    'support',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.admin_gift_audit_action as enum (
    'grant',
    'edit',
    'extend',
    'revoke'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.admin_gifts
  add column if not exists payment_source public.admin_gift_payment_source not null default 'gift';

create index if not exists idx_admin_gifts_payment_source
  on public.admin_gifts(payment_source);

create table if not exists public.admin_gift_audit_log (
  id uuid primary key default uuid_generate_v4(),
  gift_id uuid references public.admin_gifts(id) on delete set null,
  action public.admin_gift_audit_action not null,
  admin_id uuid references public.profiles(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  reason text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_gift_audit_log_gift_id
  on public.admin_gift_audit_log(gift_id);
create index if not exists idx_admin_gift_audit_log_admin_id
  on public.admin_gift_audit_log(admin_id);
create index if not exists idx_admin_gift_audit_log_user_id
  on public.admin_gift_audit_log(user_id);
create index if not exists idx_admin_gift_audit_log_created_at
  on public.admin_gift_audit_log(created_at desc);

alter table public.admin_gift_audit_log enable row level security;

drop policy if exists "Admins can read gift audit log" on public.admin_gift_audit_log;
create policy "Admins can read gift audit log"
  on public.admin_gift_audit_log
  for select
  using (public.is_admin());

drop policy if exists "Admins can insert gift audit log" on public.admin_gift_audit_log;
create policy "Admins can insert gift audit log"
  on public.admin_gift_audit_log
  for insert
  with check (public.is_admin());
