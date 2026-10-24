import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const StartCheckoutInput = z.object({ accessToken: z.string().min(20).max(4096) });
const PortalInput = z.object({ accessToken: z.string().min(20).max(4096) });

async function getVerifiedUser(accessToken: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Authentication is not configured.");
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Please sign in before continuing.");
  return data.user;
}

function getTestStripeKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith("sk_test_")) {
    throw new Error("Stripe sandbox is not configured. Live Stripe keys are intentionally blocked.");
  }
  return key;
}

async function stripePost(path: string, values: Record<string, string>) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getTestStripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values),
  });
  const result = await response.json() as { url?: string; error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message || "Stripe sandbox request failed.");
  return result;
}

export const createStripeTestCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StartCheckoutInput.parse(input))
  .handler(async ({ data }) => {
    const user = await getVerifiedUser(data.accessToken);
    const priceId = process.env.STRIPE_TEST_PRICE_ID;
    const origin = process.env.APP_BASE_URL;
    if (!priceId || !priceId.startsWith("price_")) throw new Error("Set STRIPE_TEST_PRICE_ID to the sandbox monthly price.");
    if (!origin || !origin.startsWith("https://")) throw new Error("Set APP_BASE_URL to the public HTTPS site URL.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data: existing } = await db.from("stripe_subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();

    const values: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "subscription_data[trial_period_days]": "7",
      "subscription_data[metadata][user_id]": user.id,
      "metadata[user_id]": user.id,
      client_reference_id: user.id,
      success_url: `${origin}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?checkout=cancelled`,
    };
    if (existing?.stripe_customer_id) values.customer = existing.stripe_customer_id;
    else if (user.email) values.customer_email = user.email;

    const session = await stripePost("checkout/sessions", values);
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  });

export const createStripeCustomerPortal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PortalInput.parse(input))
  .handler(async ({ data }) => {
    const user = await getVerifiedUser(data.accessToken);
    const origin = process.env.APP_BASE_URL;
    if (!origin || !origin.startsWith("https://")) throw new Error("Set APP_BASE_URL to the public HTTPS site URL.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const { data: record } = await db.from("stripe_subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    if (!record?.stripe_customer_id) throw new Error("No Stripe customer is linked to this account yet.");
    const session = await stripePost("billing_portal/sessions", {
      customer: record.stripe_customer_id,
      return_url: `${origin}/subscription`,
    });
    if (!session.url) throw new Error("Stripe did not return a customer portal URL.");
    return { url: session.url };
  });
