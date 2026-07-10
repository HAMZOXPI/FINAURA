-- Boost Marketplace: products, campaigns, and bid history

do $$ begin
  create type public.boost_product_type as enum (
    'featured_listing',
    'homepage_spotlight',
    'search_priority'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.boost_campaign_status as enum (
    'pending',
    'active',
    'expired',
    'removed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.boost_history_action as enum (
    'created',
    'activated',
    'outbid',
    'position_changed',
    'expired',
    'removed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.boost_products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  type public.boost_product_type not null,
  default_price numeric not null check (default_price >= 0),
  default_duration integer not null check (default_duration > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.boost_campaigns (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.boost_products(id) on delete restrict,
  position integer not null check (position > 0),
  amount numeric not null check (amount >= 0),
  status public.boost_campaign_status not null default 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint boost_campaigns_window_check check (
    starts_at is null
    or expires_at is null
    or expires_at > starts_at
  )
);

create table if not exists public.boost_history (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.boost_campaigns(id) on delete cascade,
  previous_position integer,
  new_position integer,
  amount numeric not null check (amount >= 0),
  action public.boost_history_action not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_boost_products_slug on public.boost_products(slug);
create index if not exists idx_boost_products_type on public.boost_products(type);
create index if not exists idx_boost_products_is_active on public.boost_products(is_active);

create index if not exists idx_boost_campaigns_listing_id on public.boost_campaigns(listing_id);
create index if not exists idx_boost_campaigns_user_id on public.boost_campaigns(user_id);
create index if not exists idx_boost_campaigns_product_id on public.boost_campaigns(product_id);
create index if not exists idx_boost_campaigns_status on public.boost_campaigns(status);
create index if not exists idx_boost_campaigns_position on public.boost_campaigns(position);
create index if not exists idx_boost_campaigns_expires_at on public.boost_campaigns(expires_at);
create index if not exists idx_boost_campaigns_active_rank
  on public.boost_campaigns(product_id, position, amount desc)
  where status = 'active';

create index if not exists idx_boost_history_campaign_id on public.boost_history(campaign_id);
create index if not exists idx_boost_history_created_at on public.boost_history(created_at desc);

insert into public.boost_products (name, slug, description, type, default_price, default_duration)
values
  (
    'Featured Listing',
    'featured-listing',
    'Premium placement at the top of featured listings.',
    'featured_listing',
    199,
    7
  ),
  (
    'Homepage Spotlight',
    'homepage-spotlight',
    'High-visibility spotlight on the homepage hero section.',
    'homepage_spotlight',
    149,
    3
  ),
  (
    'Search Priority',
    'search-priority',
    'Priority ranking in property search results.',
    'search_priority',
    99,
    14
  )
on conflict (slug) do nothing;

alter table public.boost_products enable row level security;
alter table public.boost_campaigns enable row level security;
alter table public.boost_history enable row level security;

drop policy if exists "Active boost products are viewable" on public.boost_products;
create policy "Active boost products are viewable"
  on public.boost_products
  for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage boost products" on public.boost_products;
create policy "Admins manage boost products"
  on public.boost_products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can view own boost campaigns" on public.boost_campaigns;
create policy "Users can view own boost campaigns"
  on public.boost_campaigns
  for select
  using (auth.uid() = user_id);

drop policy if exists "Active boost campaigns are viewable" on public.boost_campaigns;
create policy "Active boost campaigns are viewable"
  on public.boost_campaigns
  for select
  using (status = 'active' and expires_at is not null and expires_at > now());

drop policy if exists "Users can create boost campaigns for own listings" on public.boost_campaigns;
create policy "Users can create boost campaigns for own listings"
  on public.boost_campaigns
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties
      where id = listing_id
        and owner_id = auth.uid()
    )
  );

drop policy if exists "Users can update own boost campaigns" on public.boost_campaigns;
create policy "Users can update own boost campaigns"
  on public.boost_campaigns
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage boost campaigns" on public.boost_campaigns;
create policy "Admins manage boost campaigns"
  on public.boost_campaigns
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can view boost history for own campaigns" on public.boost_history;
create policy "Users can view boost history for own campaigns"
  on public.boost_history
  for select
  using (
    exists (
      select 1
      from public.boost_campaigns
      where id = campaign_id
        and user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert boost history for own campaigns" on public.boost_history;
create policy "Users can insert boost history for own campaigns"
  on public.boost_history
  for insert
  with check (
    exists (
      select 1
      from public.boost_campaigns
      where id = campaign_id
        and user_id = auth.uid()
    )
  );

drop policy if exists "Admins manage boost history" on public.boost_history;
create policy "Admins manage boost history"
  on public.boost_history
  for all
  using (public.is_admin())
  with check (public.is_admin());
