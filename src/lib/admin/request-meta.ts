import { headers } from "next/headers";

export async function getRequestIpAddress(): Promise<string | null> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return headerStore.get("x-real-ip") ?? headerStore.get("cf-connecting-ip") ?? null;
}
