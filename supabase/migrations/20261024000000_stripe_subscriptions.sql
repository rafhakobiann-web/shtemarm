-- Stripe sandbox subscription records for Shtemarm Plus.
-- This table is written only by trusted server-side code using the Supabase service role.
create table if not exists public.stripe_subscriptions (
  user_id uuid primary key,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  has_access boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.stripe_subscriptions enable row level security;
-- Intentionally no client policies: users cannot read or modify entitlement records directly.

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
-- Intentionally no client policies: webhook event processing is server-only.
