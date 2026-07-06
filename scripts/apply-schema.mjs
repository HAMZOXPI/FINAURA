#!/usr/bin/env node
/**
 * Applies supabase/schema.sql to the linked Supabase Postgres database.
 *
 * Set one of:
 *   DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
 *   SUPABASE_DB_PASSWORD=your-db-password  (uses NEXT_PUBLIC_SUPABASE_URL for project ref)
 *
 * Run: npm run db:apply
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const schemaPath = join(root, "supabase", "schema.sql");
const envPath = join(root, ".env.local");

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
    const host = new URL(url).hostname;
    return host.split(".")[0];
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

  const encoded = encodeURIComponent(password);
  return `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`;
}

let env = { ...process.env };

try {
  const envFile = await readFile(envPath, "utf8");
  env = { ...parseEnvFile(envFile), ...env };
} catch {
  // .env.local optional if vars are exported
}

const databaseUrl = resolveDatabaseUrl(env);

if (!databaseUrl) {
  console.error(
    [
      "Missing database credentials.",
      "",
      "Add one of the following to .env.local:",
      "  DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_REF.supabase.co:5432/postgres",
      "  SUPABASE_DB_PASSWORD=your-database-password",
      "",
      "Find the password in Supabase Dashboard → Project Settings → Database.",
      "Or paste supabase/schema.sql into the SQL Editor and click Run.",
    ].join("\n")
  );
  process.exit(1);
}

const sql = await readFile(schemaPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Applying schema...");
  await client.query(sql);
  console.log("Schema applied successfully.");
} catch (error) {
  console.error("Failed to apply schema:", error.message);
  process.exit(1);
} finally {
  await client.end();
}
