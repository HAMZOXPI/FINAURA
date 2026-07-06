-- Seller profile extensions
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists verified_seller boolean not null default false;
alter table public.profiles add column if not exists identity_verified boolean not null default false;
alter table public.profiles add column if not exists phone_verified boolean not null default false;
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists response_rate numeric not null default 98 check (response_rate >= 0 and response_rate <= 100);
alter table public.profiles add column if not exists avg_response_time_hours numeric not null default 2 check (avg_response_time_hours >= 0);
alter table public.profiles add column if not exists listings_sold_count integer not null default 0 check (listings_sold_count >= 0);

-- Seller reviews
create table if not exists public.seller_reviews (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  communication_rating integer not null check (communication_rating between 1 and 5),
  accuracy_rating integer not null check (accuracy_rating between 1 and 5),
  responsiveness_rating integer not null check (responsiveness_rating between 1 and 5),
  trust_rating integer not null check (trust_rating between 1 and 5),
  review_text text not null,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  unique (seller_id, reviewer_id)
);

-- Helpful votes on reviews
create table if not exists public.review_helpful_votes (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references public.seller_reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

-- Favorite sellers
create table if not exists public.seller_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, seller_id)
);

create index if not exists idx_seller_reviews_seller_id on public.seller_reviews(seller_id);
create index if not exists idx_seller_reviews_reviewer_id on public.seller_reviews(reviewer_id);
create index if not exists idx_review_helpful_votes_review_id on public.review_helpful_votes(review_id);
create index if not exists idx_seller_favorites_user_id on public.seller_favorites(user_id);
create index if not exists idx_seller_favorites_seller_id on public.seller_favorites(seller_id);

-- Keep helpful_count in sync
create or replace function public.sync_review_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.seller_reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.seller_reviews
    set helpful_count = greatest(helpful_count - 1, 0)
    where id = old.review_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_review_helpful_insert on public.review_helpful_votes;
create trigger trg_review_helpful_insert
  after insert on public.review_helpful_votes
  for each row execute function public.sync_review_helpful_count();

drop trigger if exists trg_review_helpful_delete on public.review_helpful_votes;
create trigger trg_review_helpful_delete
  after delete on public.review_helpful_votes
  for each row execute function public.sync_review_helpful_count();

-- Auto verification flags from profile data
create or replace function public.sync_profile_verification_flags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_verified := coalesce(new.email, '') <> '';
  new.phone_verified := coalesce(new.phone, '') <> '';
  if new.role = 'agent' then
    new.identity_verified := true;
  end if;
  if new.email_verified and new.phone_verified and new.identity_verified then
    new.verified_seller := true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_verification on public.profiles;
create trigger trg_profiles_verification
  before insert or update on public.profiles
  for each row execute function public.sync_profile_verification_flags();

-- RLS
alter table public.seller_reviews enable row level security;
alter table public.review_helpful_votes enable row level security;
alter table public.seller_favorites enable row level security;

drop policy if exists "Seller reviews are viewable by everyone" on public.seller_reviews;
create policy "Seller reviews are viewable by everyone"
  on public.seller_reviews for select using (true);

drop policy if exists "Users can insert own seller reviews" on public.seller_reviews;
create policy "Users can insert own seller reviews"
  on public.seller_reviews for insert
  with check (
    auth.uid() = reviewer_id
    and auth.uid() <> seller_id
    and exists (
      select 1
      from public.contact_inquiries ci
      join public.properties p on p.id = ci.property_id
      where ci.sender_id = auth.uid()
        and p.owner_id = seller_id
    )
  );

drop policy if exists "Review helpful votes viewable by everyone" on public.review_helpful_votes;
create policy "Review helpful votes viewable by everyone"
  on public.review_helpful_votes for select using (true);

drop policy if exists "Users can manage own helpful votes" on public.review_helpful_votes;
create policy "Users can manage own helpful votes"
  on public.review_helpful_votes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own seller favorites" on public.seller_favorites;
create policy "Users can view own seller favorites"
  on public.seller_favorites for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own seller favorites" on public.seller_favorites;
create policy "Users can insert own seller favorites"
  on public.seller_favorites for insert
  with check (auth.uid() = user_id and auth.uid() <> seller_id);

drop policy if exists "Users can delete own seller favorites" on public.seller_favorites;
create policy "Users can delete own seller favorites"
  on public.seller_favorites for delete using (auth.uid() = user_id);
