import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { assertSupabaseConfigured } from "@/lib/supabase/config";

export async function middleware(request: NextRequest) {
  assertSupabaseConfigured();
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
