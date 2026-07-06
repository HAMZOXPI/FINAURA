-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'user' check (role in ('user', 'agent', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  property_type text not null check (property_type in ('appartement', 'villa', 'maison', 'terrain', 'local_commercial', 'bureau', 'ferme', 'riad')),
  status text not null default 'for_sale' check (status in ('for_sale', 'for_rent', 'sold', 'pending')),
  listing_status text not null default 'draft' check (listing_status in ('draft', 'published', 'archived')),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  area_sqft numeric not null default 0 check (area_sqft >= 0),
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null default 'Maroc',
  latitude numeric,
  longitude numeric,
  features text[] not null default '{}',
  images text[] not null default '{}',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, property_id)
);

-- Subscription plans
create table if not exists public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  price_monthly numeric not null default 0 check (price_monthly >= 0),
  max_listings integer,
  max_favorites integer,
  features text[] not null default '{}',
  stripe_price_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User subscriptions
create table if not exists public.user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Contact inquiries (messages to sellers)
create table if not exists public.contact_inquiries (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  message text not null,
  created_at timestamptz not null default now()
);
