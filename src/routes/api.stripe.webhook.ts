import { createFileRoute } from "@tanstack/react-router";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, any> };
};

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyStripeSignature(rawBody: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${rawBody}`));
  const expected = bytesToHex(signed);
  return signatures.some((signature) => {
    if (signature.length !== expected.length) return false;
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return difference === 0;
  });
}

function testStripeKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith("sk_test_")) throw new Error("Test-mode Stripe key required.");
  return key;
}

async function stripeGetSubscription(id: string) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${testStripeKey()}` },
  });
  if (!response.ok) throw new Error("Could not retrieve Stripe subscription.");
  return await response.json() as Record<string, any>;
}

async function saveSubscription(subscription: Record<string, any>, customerFallback?: string) {
  const userId = subscription.metadata?.user_id;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : customerFallback;
  if (!userId || !customerId || !subscription.id) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;
  const status = String(subscription.status || "inactive");
  const paidStatus = status === "active" || status === "trialing";
  const { error } = await db.from("stripe_subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    has_access: paidStatus,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw new Error("Could not update subscription record.");
}

async function handleStripeEvent(event: StripeEvent) {
  const object = event.data.object;
  if (event.type === "checkout.session.completed") {
    const subscriptionId = typeof object.subscription === "string" ? object.subscription : object.subscription?.id;
    if (subscriptionId) await saveSubscription(await stripeGetSubscription(subscriptionId), typeof object.customer === "string" ? object.customer : undefined);
    return;
  }
  if (event.type.startsWith("customer.subscription.")) {
    await saveSubscription(object);
    return;
  }
  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const subscriptionId = typeof object.subscription === "string" ? object.subscription : object.parent?.subscription_details?.subscription;
    if (subscriptionId) await saveSubscription(await stripeGetSubscription(subscriptionId));
  }
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_TEST_WEBHOOK_SECRET;
        if (!secret || !secret.startsWith("whsec_")) return new Response("Webhook not configured", { status: 503 });
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });
        const rawBody = await request.text();
        if (!(await verifyStripeSignature(rawBody, signature, secret))) return new Response("Invalid signature", { status: 400 });

        let event: StripeEvent;
        try {
          event = JSON.parse(rawBody) as StripeEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        const { error: seenError } = await db.from("stripe_webhook_events").insert({ event_id: event.id, event_type: event.type });
        if (seenError?.code === "23505") return Response.json({ received: true, duplicate: true });
        if (seenError) return new Response("Webhook event store unavailable", { status: 500 });

        try {
          await handleStripeEvent(event);
          return Response.json({ received: true });
        } catch (error) {
          // Remove the deduplication record on processing failure so Stripe retries can safely retry.
          await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
          console.error("[Stripe webhook] Event processing failed:", error instanceof Error ? error.message : "unknown error");
          return new Response("Webhook processing failed", { status: 500 });
        }
      },
    },
  },
});
