# Stripe sandbox setup for Shtemarm

This integration is deliberately sandbox-only. Server code rejects any Stripe secret key that does not start with `sk_test_`. Do not enable live charges or replace this guard until merchant eligibility, account verification, and a separate production review are complete.

## 1. Confirm eligibility first

Stripe's current supported-country list does not include Armenia: https://stripe.com/global. An Armenia-only business cannot directly activate a standard Stripe Payments account based solely on Armenian establishment. Opening an account in another country requires genuine eligibility and supporting documentation; do not use inaccurate address, entity, tax, or bank details. Have a parent/guardian and qualified business adviser handle account ownership and compliance.

## 2. Create test-mode resources

In Stripe Dashboard, switch to a sandbox/test environment and create:
- Product: `Shtemarm Plus`
- Recurring price: `$3.00 USD`, monthly
- A test webhook endpoint pointed at `https://YOUR_PUBLIC_HOST/api/stripe/webhook`

Configure these test webhook events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

The Checkout server function sets a 7-day trial. Configure the test price as recurring monthly. Use a public HTTPS URL for `APP_BASE_URL`.

## 3. Environment variables

Set these in the hosting provider's **server-side environment settings**, for the preview/test deployment only:

- `STRIPE_SECRET_KEY`: sandbox secret key beginning `sk_test_`
- `STRIPE_TEST_PRICE_ID`: test recurring Price ID beginning `price_`
- `STRIPE_TEST_WEBHOOK_SECRET`: sandbox webhook signing secret beginning `whsec_`
- `APP_BASE_URL`: public HTTPS base URL, e.g. `https://shtemarm.lovable.app`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key already used by the project

Never use `VITE_` prefixes for Stripe secrets. Never commit any secret value to GitHub or paste it into a chat.

## 4. Apply the database migration

Run `supabase/migrations/20261024000000_stripe_subscriptions.sql` against the project's Supabase database using the project's normal migration workflow. The migration creates private subscription entitlement and webhook deduplication tables. It does not grant users permission to update their own subscription status.

## 5. Test carefully

1. Deploy to a preview environment with test keys only.
2. Sign in to Shtemarm, open `/subscription`, and click the sandbox checkout button.
3. Use Stripe's documented test card numbers in test mode only.
4. Confirm Stripe sends signed webhook events and that `stripe_subscriptions` updates.
5. Test the 7-day trial, renewal, cancellation, failed payment, and duplicate webhook delivery.
6. Confirm a redirect to the success page alone does not grant access; only the verified webhook updates the server-side record.
7. Confirm the Customer Portal works after the first Checkout session creates a customer.

## Implementation notes

- `src/lib/stripe.functions.ts`: validates the signed-in Supabase user and creates hosted Checkout / Customer Portal sessions using server-side Stripe REST calls.
- `src/routes/api.stripe.webhook.ts`: validates the Stripe signature against the raw request body, checks timestamp freshness, and deduplicates event IDs.
- `src/routes/subscription.tsx`: sandbox-only checkout and portal controls.
- `supabase/migrations/20261024000000_stripe_subscriptions.sql`: private subscription state and webhook event records.

This initial implementation is not production-ready. Before any live rollout, review authentication/session handling, entitlement checks across every premium feature, subscription cancellation and failed-payment grace policy, webhook replay/idempotency behavior, privacy and legal requirements, and run a successful build plus end-to-end tests.
