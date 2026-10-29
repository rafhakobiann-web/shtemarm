-- Feedback is written and read exclusively by server functions using the
-- service role. Do not permit direct public Supabase table access.
alter table public.feedback enable row level security;
drop policy if exists "anyone can send feedback" on public.feedback;
revoke all on table public.feedback from anon, authenticated;
-- Service-role access remains available to the trusted server functions.
