#!/usr/bin/env node
/**
 * End-to-end verification against real Supabase.
 * Run: node scripts/e2e-verify.mjs
 *
 * For authenticated checks after signup, either:
 * - Disable "Confirm email" in Supabase Auth settings (recommended for local dev), or
 * - Set SUPABASE_SERVICE_ROLE_KEY in .env.local, or
 * - Set SUPABASE_DB_PASSWORD / DATABASE_URL for auto-confirm via SQL
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TEST_EMAIL = `finaura.e2e.${Date.now()}@mailinator.com`;
const TEST_PASSWORD = "FinauraE2E123!";
const TEST_NAME = "E2E Test User";

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return null;
  }
}

function resolveDatabaseUrl(env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !supabaseUrl) return null;
  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) return null;
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function pass(label) {
  console.log(`✓ ${label}`);
}

function fail(label, detail) {
  console.error(`✗ ${label}${detail ? `: ${detail}` : ""}`);
  process.exitCode = 1;
}

const envFile = await readFile(join(root, ".env.local"), "utf8");
const env = { ...parseEnvFile(envFile), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`\nE2E verification — ${TEST_EMAIL}\n`);

async function countProfiles() {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function confirmUserEmail(userId) {
  if (serviceRoleKey) {
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return "service role";
  }

  const databaseUrl = resolveDatabaseUrl(env);
  if (databaseUrl) {
    const client = new pg.Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query(
      "update auth.users set email_confirmed_at = now(), confirmed_at = now() where id = $1",
      [userId]
    );
    await client.end();
    return "database";
  }

  return null;
}

async function getSession(userId) {
  let accessToken = null;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: { data: { full_name: TEST_NAME } },
  });

  if (signUpError) {
    if (/rate limit/i.test(signUpError.message)) {
      fail("Sign up", `${signUpError.message} — wait a few minutes or disable email confirmation in Supabase Auth`);
    } else {
      fail("Sign up", signUpError.message);
    }
    return null;
  }
  pass("Sign up");

  if (signUpData.session?.access_token) {
    pass("Session created on signup (email confirmation disabled)");
    return {
      accessToken: signUpData.session.access_token,
      userId: signUpData.user.id,
    };
  }

  const profilesBefore = await countProfiles();
  await new Promise((r) => setTimeout(r, 1500));
  const profilesAfter = await countProfiles();

  if (profilesAfter > profilesBefore) {
    pass("Profile auto-created on signup");
  } else {
    fail("Profile auto-created on signup");
  }

  const confirmMethod = await confirmUserEmail(signUpData.user.id);
  if (!confirmMethod) {
    fail(
      "Sign in",
      'Email not confirmed. Disable "Confirm email" in Supabase Auth, or set SUPABASE_SERVICE_ROLE_KEY / SUPABASE_DB_PASSWORD in .env.local'
    );
    return null;
  }
  pass(`Email confirmed via ${confirmMethod}`);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInError || !signInData.session?.access_token) {
    fail("Sign in", signInError?.message ?? "No session");
    return null;
  }

  pass("Sign in");
  return {
    accessToken: signInData.session.access_token,
    userId: signUpData.user.id,
  };
}

const session = await getSession();
if (!session) {
  process.exit(process.exitCode || 1);
}

const { accessToken, userId } = session;
const authed = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${accessToken}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: profile, error: profileError } = await authed
  .from("profiles")
  .select("id, role")
  .eq("id", userId)
  .single();

if (profileError || !profile) {
  fail("Profile readable for authenticated user", profileError?.message);
} else {
  pass("Profile readable for authenticated user");
}

const { data: subscription, error: subError } = await authed
  .from("user_subscriptions")
  .select("plan:subscription_plans(slug)")
  .eq("user_id", userId)
  .maybeSingle();

const planSlug = subscription?.plan?.slug;
if (subError || !planSlug) {
  fail("Free subscription assigned", subError?.message);
} else {
  pass(`Subscription assigned (${planSlug})`);
}

const propertyPayload = {
  title: "E2E Test Home",
  description: "Automated end-to-end test listing.",
  price: 425000,
  property_type: "appartement",
  status: "for_sale",
  listing_status: "published",
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1800,
  address: "123 Test Street",
  city: "Casablanca",
  state: "Casablanca-Settat",
  zip_code: "20000",
  country: "Maroc",
  features: ["Garage", "Garden"],
  images: [],
  owner_id: userId,
  is_featured: false,
};

const { data: created, error: createError } = await authed
  .from("properties")
  .insert(propertyPayload)
  .select("id, title")
  .single();

if (createError || !created) {
  fail("Create property", createError?.message);
  process.exit(1);
}
pass("Create property");

const { data: fetched, error: fetchError } = await authed
  .from("properties")
  .select("title")
  .eq("id", created.id)
  .single();

if (fetchError || fetched?.title !== "E2E Test Home") {
  fail("Property stored in Supabase", fetchError?.message);
} else {
  pass("Property stored in Supabase");
}

const { error: updateError } = await authed
  .from("properties")
  .update({ title: "E2E Test Home Updated", price: 430000 })
  .eq("id", created.id)
  .eq("owner_id", userId);

if (updateError) {
  fail("Edit property", updateError.message);
} else {
  pass("Edit property");
}

const { error: favError } = await authed.from("favorites").insert({
  user_id: userId,
  property_id: created.id,
});

if (favError) {
  fail("Add favorite", favError.message);
} else {
  pass("Add favorite");
}

const { error: msgError } = await authed.from("contact_inquiries").insert({
  property_id: created.id,
  sender_id: userId,
  sender_name: TEST_NAME,
  sender_email: TEST_EMAIL,
  message: "E2E test inquiry message.",
});

if (msgError) {
  fail("Contact message", msgError.message);
} else {
  pass("Contact message");
}

const { data: stats, error: statsError } = await authed.rpc("get_dashboard_stats", {
  p_user_id: userId,
});

if (statsError) {
  fail("Dashboard stats RPC", statsError.message);
} else if ((stats.listings_count ?? 0) < 1) {
  fail("Dashboard stats", `listings_count=${stats.listings_count}`);
} else {
  pass(
    `Dashboard stats (listings=${stats.listings_count}, favorites=${stats.favorites_count}, messages=${stats.messages_count})`
  );
}

await authed.from("favorites").delete().eq("user_id", userId).eq("property_id", created.id);
pass("Remove favorite");

const { error: deleteError } = await authed
  .from("properties")
  .delete()
  .eq("id", created.id)
  .eq("owner_id", userId);

if (deleteError) {
  fail("Delete property", deleteError.message);
} else {
  pass("Delete property");
}

await supabase.auth.signOut();
pass("Sign out");

const { data: plans, error: plansError } = await supabase
  .from("subscription_plans")
  .select("slug")
  .eq("is_active", true);

if (plansError || (plans?.length ?? 0) < 3) {
  fail("Subscription plans readable", plansError?.message);
} else {
  pass(`Subscription plans (${plans.length} active)`);
}

const pages = ["/", "/properties", "/pricing", "/login", "/register"];
for (const page of pages) {
  const res = await fetch(`${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${page}`);
  if (res.ok) {
    pass(`Page ${page} (${res.status})`);
  } else {
    fail(`Page ${page}`, `status ${res.status}`);
  }
}

console.log(
  "\n" + (process.exitCode ? "Some checks failed." : "All E2E checks passed.")
);
console.log(`Test account: ${TEST_EMAIL}\n`);
