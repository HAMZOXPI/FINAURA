# Finaura

A modern SaaS real estate platform built with Next.js 15, React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Property Listings** — Browse, search, and filter premium real estate
- **Property Details** — Image gallery, features, map, and seller contact form
- **User Authentication** — Register, login, logout with Supabase Auth
- **Favorites** — Save properties (plan limits enforced)
- **Dashboard** — Create, edit, delete listings; view stats and messages
- **Contact Seller** — Inquiries stored in Supabase
- **Row Level Security** — All data protected at the database level
- **SEO Optimized** — Metadata, sitemap, structured data

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Auth, PostgreSQL, Storage, RLS
- [Lucide React](https://lucide.dev/) (Icons)

---

## Connect Supabase (Required for Production)

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project and note your **Project URL** and **anon key**

### Step 3 — Run the database schema

Open the Supabase **SQL Editor** and run the full contents of:

```
supabase/schema.sql
```

Or regenerate from migrations:

```bash
npm run db:generate
```

Then paste the generated `supabase/schema.sql` into the SQL Editor.

This creates all tables, RLS policies, triggers, storage bucket, and dashboard functions.

> See [`supabase/README.md`](./supabase/README.md) for detailed setup, RLS documentation, and troubleshooting.

### Step 4 — Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get values from Supabase → **Project Settings** → **API**.

### Step 5 — Configure Auth redirect URLs

In Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/**`

For local development, you may disable email confirmation under **Authentication** → **Providers** → **Email**.

### Step 6 — Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Register at `/register`
2. Sign in at `/login`
3. Create listings at `/dashboard/new`

---

## Demo Mode (No Supabase)

If env vars are not set, the app runs with local demo data. Authentication and property persistence require Supabase.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Build `supabase/schema.sql` from migrations |

---

## Backend Architecture

```
src/
├── lib/supabase/          # Clients, config, auth helpers
├── actions/               # Server actions (auth, properties)
├── services/              # Data access layer
├── types/database.ts      # TypeScript types + Supabase schema types
supabase/
├── migrations/            # Source SQL migration files
├── schema.sql             # Generated full schema (run in Supabase)
└── README.md              # Detailed Supabase guide
```

### Server Actions

| Action | File | Description |
|--------|------|-------------|
| `signUp` | `auth.actions.ts` | Register new user |
| `signIn` | `auth.actions.ts` | Login with email/password |
| `signOut` | `auth.actions.ts` | Logout and clear session |
| `createProperty` | `property.actions.ts` | Create listing |
| `updateProperty` | `property.actions.ts` | Edit listing |
| `deleteProperty` | `property.actions.ts` | Delete listing |
| `toggleFavorite` | `property.actions.ts` | Add/remove favorite |
| `submitContactInquiry` | `property.actions.ts` | Contact seller message |
| `uploadPropertyImages` | `property.actions.ts` | Upload to Supabase Storage |

### Services

| Service | Description |
|---------|-------------|
| `property.service.ts` | List, filter, detail, user properties |
| `dashboard.service.ts` | Dashboard stats via `get_dashboard_stats` RPC |
| `message.service.ts` | Seller contact inquiries |
| `user.service.ts` | Profile read/update |
| `subscription.service.ts` | Plan limits for listings and favorites |

### Route Protection

- **Middleware** (`src/middleware.ts`) refreshes Supabase session on every request
- **Dashboard routes** (`/dashboard/*`) redirect to `/login` when unauthenticated
- **Auth routes** (`/login`, `/register`) redirect to `/dashboard` when logged in

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home with hero, search, featured properties |
| `/properties` | Browse listings with filters |
| `/properties/[id]` | Property detail page |
| `/pricing` | Subscription plans |
| `/dashboard` | Overview with statistics |
| `/dashboard/properties` | Manage your listings |
| `/dashboard/favorites` | Saved favorites |
| `/dashboard/messages` | Contact inquiries |
| `/dashboard/settings` | Profile settings |
| `/dashboard/new` | Create listing |
| `/dashboard/[id]/edit` | Edit listing |
| `/login` | Sign in |
| `/register` | Create account |

## License

MIT
