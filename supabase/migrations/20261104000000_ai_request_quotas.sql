-- Atomic shared AI budget. Every remote model call must reserve before executing.
-- The only privileged caller is the server's Supabase service role.
-- No student email, prompt, IP address, or plaintext user ID is stored.
create table if not exists public.ai_request_counters (
  bucket text not null check (char_length(bucket) between 1 and 110),
  period_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  primary key (bucket, period_start)
);

alter table public.ai_request_counters enable row level security;
revoke all on table public.ai_request_counters from public, anon, authenticated;
grant select, insert, update, delete on table public.ai_request_counters to service_role;

-- A short transaction-scoped lock serializes concurrent reservations so that
-- each subject/day, site/day and site/minute bound is enforced atomically.
create or replace function public.reserve_ai_request(
  p_subject text,
  p_subject_daily_limit integer,
  p_global_daily_limit integer,
  p_global_minute_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $quota$
declare
  v_now timestamptz := now();
  v_day timestamptz := date_trunc('day', v_now at time zone 'UTC') at time zone 'UTC';
  v_minute timestamptz := date_trunc('minute', v_now at time zone 'UTC') at time zone 'UTC';
  v_subject_bucket text;
  v_used_subject integer;
  v_used_daily integer;
  v_used_minute integer;
begin
  if p_subject is null or p_subject !~ '^(guest|admin|user:[a-f0-9]{64})$'
    or p_subject_daily_limit < 1 or p_subject_daily_limit > 10000
    or p_global_daily_limit < 1 or p_global_daily_limit > 100000
    or p_global_minute_limit < 1 or p_global_minute_limit > 10000
  then
    return false;
  end if;

  v_subject_bucket := 'subject:' || p_subject;
  perform pg_catalog.pg_advisory_xact_lock(14477, 16285);

  insert into public.ai_request_counters(bucket, period_start, used)
    values (v_subject_bucket, v_day, 0), ('global:day', v_day, 0),
           ('global:minute', v_minute, 0)
    on conflict (bucket, period_start) do nothing;

  select used into v_used_subject from public.ai_request_counters
    where bucket = v_subject_bucket and period_start = v_day;
  select used into v_used_daily from public.ai_request_counters
    where bucket = 'global:day' and period_start = v_day;
  select used into v_used_minute from public.ai_request_counters
    where bucket = 'global:minute' and period_start = v_minute;

  if v_used_subject >= p_subject_daily_limit
    or v_used_daily >= p_global_daily_limit
    or v_used_minute >= p_global_minute_limit
  then
    return false;
  end if;

  update public.ai_request_counters
     set used = used + 1
   where bucket = v_subject_bucket and period_start = v_day;
  update public.ai_request_counters
     set used = used + 1
   where bucket = 'global:day' and period_start = v_day;
  update public.ai_request_counters
     set used = used + 1
   where bucket = 'global:minute' and period_start = v_minute;
  return true;
end;
$quota$;

revoke all on function public.reserve_ai_request(text,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.reserve_ai_request(text,integer,integer,integer)
  to service_role;

comment on function public.reserve_ai_request(text,integer,integer,integer)
  is 'Service-role-only atomic reservation for Shtemarm shared AI quotas.';
