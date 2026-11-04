-- Defense in depth: feedback contains private visitor messages, optional
-- contact information and developer replies. It is never public data.
-- The public form submits through a validated server function using the
-- service-role Supabase client. Direct browser table access is not required.
alter table public.feedback enable row level security;

revoke all privileges on table public.feedback from public, anon, authenticated;

-- Keep preexisting rows and trusted server management unchanged.
-- Intentionally do not create anonymous SELECT policies.
comment on table public.feedback is
  'Private support messages and replies: no direct anon/authenticated table privileges; trusted server access only.';
