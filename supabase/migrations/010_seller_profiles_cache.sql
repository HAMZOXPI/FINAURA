-- Seller profile stats cache (1:1 with profiles)
create table if not exists public.seller_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  average_rating numeric(3, 2) not null default 0
    check (average_rating >= 0 and average_rating <= 5),
  total_reviews integer not null default 0 check (total_reviews >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seller_profiles_average_rating
  on public.seller_profiles(average_rating desc);

create index if not exists idx_seller_profiles_total_reviews
  on public.seller_profiles(total_reviews desc);

-- Backfill stats from existing reviews
insert into public.seller_profiles (id, average_rating, total_reviews)
select
  p.id,
  coalesce(round(avg(sr.rating)::numeric, 2), 0),
  count(sr.id)::integer
from public.profiles p
left join public.seller_reviews sr on sr.seller_id = p.id
group by p.id
on conflict (id) do update set
  average_rating = excluded.average_rating,
  total_reviews = excluded.total_reviews,
  updated_at = now();

-- Ensure every profile has a seller_profiles row
create or replace function public.ensure_seller_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.seller_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_ensure_seller_profile on public.profiles;
create trigger trg_ensure_seller_profile
  after insert on public.profiles
  for each row execute function public.ensure_seller_profile();

-- Recalculate average rating and review count when reviews change
create or replace function public.sync_seller_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_seller uuid;
begin
  if tg_op = 'DELETE' then
    target_seller := old.seller_id;
  else
    target_seller := new.seller_id;
  end if;

  insert into public.seller_profiles (id, average_rating, total_reviews, updated_at)
  select
    target_seller,
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::integer,
    now()
  from public.seller_reviews
  where seller_id = target_seller
  on conflict (id) do update set
    average_rating = excluded.average_rating,
    total_reviews = excluded.total_reviews,
    updated_at = now();

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_seller_review_stats_insert on public.seller_reviews;
create trigger trg_seller_review_stats_insert
  after insert on public.seller_reviews
  for each row execute function public.sync_seller_review_stats();

drop trigger if exists trg_seller_review_stats_update on public.seller_reviews;
create trigger trg_seller_review_stats_update
  after update of rating on public.seller_reviews
  for each row execute function public.sync_seller_review_stats();

drop trigger if exists trg_seller_review_stats_delete on public.seller_reviews;
create trigger trg_seller_review_stats_delete
  after delete on public.seller_reviews
  for each row execute function public.sync_seller_review_stats();

alter table public.seller_profiles enable row level security;

drop policy if exists "Seller profile stats are viewable by everyone" on public.seller_profiles;
create policy "Seller profile stats are viewable by everyone"
  on public.seller_profiles for select using (true);

-- Profile avatars storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Profile avatars are publicly accessible" on storage.objects;
create policy "Profile avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');

drop policy if exists "Users can upload own profile avatar" on storage.objects;
create policy "Users can upload own profile avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own profile avatar" on storage.objects;
create policy "Users can update own profile avatar"
  on storage.objects for update
  using (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own profile avatar" on storage.objects;
create policy "Users can delete own profile avatar"
  on storage.objects for delete
  using (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
