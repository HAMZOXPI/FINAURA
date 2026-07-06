# Supabase Setup for Finaura

This folder contains the complete PostgreSQL schema, Row Level Security policies, storage configuration, and database functions for Finaura.

## Quick Start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to finish provisioning

### 2. Run the database schema

**Option A — Full schema (recommended)**

1. Open your project → **SQL Editor**
2. Copy the contents of [`schema.sql`](./schema.sql)
3. Click **Run**

**Option B — Regenerate schema from migrations**

```bash
npm run db:generate
```

This concatenates all files in `supabase/migrations/` into `supabase/schema.sql`.

### 3. Configure authentication

In Supabase Dashboard → **Authentication** → **URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `http://localhost:3000` (or your production URL) |
| Redirect URLs | `http://localhost:3000/**` |

For email confirmation (optional in development):

- **Authentication** → **Providers** → **Email**
- Disable "Confirm email" for faster local testing, or enable for production

Alternatively, add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Project Settings → API). The app will auto-confirm new signups locally when this key is set.

Run automated verification:

```bash
npm run e2e:verify
```

### 4. Verify storage bucket

The schema creates a public `property-images` bucket. Confirm in **Storage**:

- Bucket name: `property-images`
- Public: **Yes**
- Max file size: 5 MB
- Allowed types: JPEG, PNG, WebP, GIF

### 5. Connect the Next.js app

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find credentials in **Project Settings** → **API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Restart the dev server after updating env vars.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `properties` | Property listings |
| `favorites` | Saved properties per user |
| `contact_inquiries` | Messages from buyers to sellers |
| `subscription_plans` | Pricing tiers (Free, Pro, Enterprise) |
| `user_subscriptions` | Active plan per user (auto-assigned Free) |

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

| Resource | Who can read | Who can write |
|----------|--------------|---------------|
| `profiles` | Everyone | Owner updates own profile |
| `properties` | Published listings (public); all own listings (owner) | Owner CRUD only |
| `favorites` | Own favorites | Own favorites |
| `contact_inquiries` | Property owners | Anyone can insert |
| `subscription_plans` | Everyone (active plans) | — |
| `user_subscriptions` | Own subscription | Auto via trigger |
| `storage.property-images` | Public read | Authenticated upload to own folder |

## Database Functions

| Function | Description |
|----------|-------------|
| `handle_new_user()` | Creates profile on auth signup |
| `handle_new_user_subscription()` | Assigns Free plan on profile creation |
| `get_dashboard_stats(user_id)` | Returns listings, published, favorites, messages counts |

## Backend Architecture

```
src/
├── lib/supabase/
│   ├── config.ts      # Env validation, isSupabaseConfigured()
│   ├── server.ts      # Server-side Supabase client (cookies)
│   ├── client.ts      # Browser Supabase client
│   ├── middleware.ts  # Session refresh in middleware
│   └── auth.ts        # requireUser(), resolveUserId()
├── actions/
│   ├── auth.actions.ts      # signUp, signIn, signOut, updateProfile
│   └── property.actions.ts  # CRUD, favorites, contact, image upload
├── services/
│   ├── property.service.ts   # List, detail, user properties, favorites
│   ├── dashboard.service.ts  # Dashboard statistics (RPC)
│   ├── message.service.ts    # Seller contact inquiries
│   ├── user.service.ts       # Profile management
│   └── subscription.service.ts # Plan limits enforcement
└── middleware.ts             # Protects /dashboard/* routes
```

## Migration Files

Edit individual migration files, then regenerate:

```
supabase/migrations/
├── 001_extensions.sql
├── 002_tables.sql
├── 003_indexes.sql
├── 004_functions_triggers.sql
├── 005_rls_policies.sql
└── 006_storage.sql
```

```bash
npm run db:generate
```

## Troubleshooting

**"Authentication is not configured"**
- Ensure `.env.local` exists with real Supabase URL and anon key (not placeholder values)

**Dashboard redirects to login**
- Expected when Supabase is configured and you're not signed in
- Register at `/register`, then sign in at `/login`

**Property images fail to upload**
- Confirm `property-images` bucket exists and RLS policies are applied
- Images are stored at `{user_id}/{filename}` in the bucket

**RLS permission denied**
- Re-run `schema.sql` to ensure all policies exist
- Check that the user is authenticated (`auth.uid()` is set)

**Email confirmation blocks login**
- Disable email confirmation in Supabase Auth settings for development
- Or confirm email via the link sent by Supabase
