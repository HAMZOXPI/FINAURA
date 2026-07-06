-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

-- Profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Properties
drop policy if exists "Published properties are viewable by everyone" on public.properties;
create policy "Published properties are viewable by everyone"
  on public.properties for select
  using (listing_status = 'published' or auth.uid() = owner_id);

drop policy if exists "Users can insert own properties" on public.properties;
create policy "Users can insert own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own properties" on public.properties;
create policy "Users can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own properties" on public.properties;
create policy "Users can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

-- Favorites
drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Contact inquiries
drop policy if exists "Property owners can view inquiries for their properties" on public.contact_inquiries;
create policy "Property owners can view inquiries for their properties"
  on public.contact_inquiries for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = contact_inquiries.property_id
      and properties.owner_id = auth.uid()
    )
  );

drop policy if exists "Anyone can submit contact inquiries" on public.contact_inquiries;
create policy "Anyone can submit contact inquiries"
  on public.contact_inquiries for insert
  with check (true);

-- Subscription plans (read-only for clients)
drop policy if exists "Plans are viewable by everyone" on public.subscription_plans;
create policy "Plans are viewable by everyone"
  on public.subscription_plans for select using (is_active = true);

-- User subscriptions
drop policy if exists "Users can view own subscription" on public.user_subscriptions;
create policy "Users can view own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);
