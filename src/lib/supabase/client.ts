import { createBrowserClient } from "@supabase/ssr";
import {
  assertSupabaseConfigured,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
}
