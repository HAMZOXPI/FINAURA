-- Boost payment sessions (fake now, Stripe later)

do $$ begin
  create type public.boost_payment_provider as enum ('fake', 'stripe');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.boost_payment_status as enum ('pending', 'succeeded', 'failed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.boost_payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.properties(id) on delete cascade,
  product_id uuid not null references public.boost_products(id) on delete restrict,
  campaign_id uuid references public.boost_campaigns(id) on delete set null,
  position integer not null check (position > 0),
  amount numeric not null check (amount >= 0),
  provider public.boost_payment_provider not null default 'fake',
  provider_payment_id text,
  status public.boost_payment_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_boost_payments_user_id on public.boost_payments(user_id);
create index if not exists idx_boost_payments_listing_id on public.boost_payments(listing_id);
create index if not exists idx_boost_payments_status on public.boost_payments(status);
create index if not exists idx_boost_payments_campaign_id on public.boost_payments(campaign_id);

alter table public.boost_payments enable row level security;

drop policy if exists "Users can view own boost payments" on public.boost_payments;
create policy "Users can view own boost payments"
  on public.boost_payments
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own boost payments" on public.boost_payments;
create policy "Users can create own boost payments"
  on public.boost_payments
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pending boost payments" on public.boost_payments;
create policy "Users can update own pending boost payments"
  on public.boost_payments
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage boost payments" on public.boost_payments;
create policy "Admins manage boost payments"
  on public.boost_payments
  for all
  using (public.is_admin())
  with check (public.is_admin());
