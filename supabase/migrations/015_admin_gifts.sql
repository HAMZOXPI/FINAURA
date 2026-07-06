-- Admin promotions & gifts

do $$ begin
  create type public.admin_gift_type as enum (
    'unlimited_listings',
    'extra_listing_credits',
    'premium_subscription',
    'featured_listing_credits',
    'boost_credits',
    'discount_coupon'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.admin_gift_status as enum (
    'active',
    'expired',
    'revoked'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.admin_gifts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gift_type public.admin_gift_type not null,
  quantity integer,
  quantity_remaining integer,
  duration_days integer,
  expires_at timestamptz,
  status public.admin_gift_status not null default 'active',
  granted_by uuid references public.profiles(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_gifts_user_id on public.admin_gifts(user_id);
create index if not exists idx_admin_gifts_status on public.admin_gifts(status);
create index if not exists idx_admin_gifts_gift_type on public.admin_gifts(gift_type);
create index if not exists idx_admin_gifts_expires_at on public.admin_gifts(expires_at);
create index if not exists idx_admin_gifts_created_at on public.admin_gifts(created_at desc);

drop trigger if exists admin_gifts_updated_at on public.admin_gifts;
create trigger admin_gifts_updated_at
  before update on public.admin_gifts
  for each row execute function public.update_updated_at();

alter table public.admin_gifts enable row level security;

drop policy if exists "Admins can read all admin gifts" on public.admin_gifts;
create policy "Admins can read all admin gifts"
  on public.admin_gifts
  for select
  using (public.is_admin());

drop policy if exists "Admins can insert admin gifts" on public.admin_gifts;
create policy "Admins can insert admin gifts"
  on public.admin_gifts
  for insert
  with check (public.is_admin());

drop policy if exists "Admins can update admin gifts" on public.admin_gifts;
create policy "Admins can update admin gifts"
  on public.admin_gifts
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Allow admins to grant premium subscriptions
drop policy if exists "Admins can update all subscriptions" on public.user_subscriptions;
create policy "Admins can update all subscriptions"
  on public.user_subscriptions
  for update
  using (public.is_admin())
  with check (public.is_admin());
