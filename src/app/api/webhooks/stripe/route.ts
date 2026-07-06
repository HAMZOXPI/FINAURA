import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const result = await handleStripeWebhook(payload, signature);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
