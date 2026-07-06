/**
 * Supabase environment configuration.
 */

const PLACEHOLDER_PATTERNS = ["your-project", "your-anon-key", "YOUR_PROJECT_REF"];

function trimEnv(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

export function getSupabaseUrl(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return false;
  return !PLACEHOLDER_PATTERNS.some(
    (p) => url.includes(p) || key.includes(p)
  );
}

export function getSiteUrl(): string {
  return trimEnv(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000";
}

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
}
