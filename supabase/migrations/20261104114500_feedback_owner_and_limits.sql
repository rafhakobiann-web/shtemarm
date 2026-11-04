-- Private feedback belongs only to its verified Supabase author.
-- Unauthenticated legacy messages stay private, without trying to transfer
-- ownership from a user-controlled browser clientId.
alter table public.feedback add column if not exists user_id uuid;
create index if not exists feedback_owner_created_idx
  on public.feedback (user_id, created_at desc)
  where user_id is not null;

alter table public.feedback enable row level security;
revoke all privileges on table public.feedback from public, anon, authenticated;

-- The public feedback form is intentionally write-only via server functions.
-- Strict shared quotas prevent changing clientId to evade all rate-limits.
create table if not exists public.feedback_request_counters (
  bucket text not null check (char_length(bucket) between 1 and 96),
  period_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  primary key (bucket, period_start)
);
alter table public.feedback_request_counters enable row level security;
revoke all privileges on table public.feedback_request_counters from public, anon, authenticated;
grant select, insert, update, delete on table public.feedback_request_counters to service_role;

create or replace function public.reserve_feedback_submission(p_client_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $feedback_quota$
declare
  v_time timestamptz := now();
  v_day timestamptz := date_trunc('day', v_time at time zone 'UTC') at time zone 'UTC';
  v_minute timestamptz := date_trunc('minute', v_time at time zone 'UTC') at time zone 'UTC';
  v_key text;
  v_client integer;
  v_total integer;
  v_per_minute integer;
begin
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    return false;
  end if;
  v_key := 'client:' || p_client_hash;
  perform pg_catalog.pg_advisory_xact_lock(14477, 16594);
  insert into public.feedback_request_counters(bucket, period_start, used)
    values (v_key, v_day, 0), ('global:feedback:day', v_day, 0),
           ('global:feedback:minute', v_minute, 0)
    on conflict (bucket, period_start) do nothing;

  select used into v_client from public.feedback_request_counters
    where bucket = v_key and period_start = v_day;
  select used into v_total from public.feedback_request_counters
    where bucket = 'global:feedback:day' and period_start = v_day;
  select used into v_per_minute from public.feedback_request_counters
    where bucket = 'global:feedback:minute' and period_start = v_minute;

  -- 5/day per browser identity, 250/day and 12/minute for all visitors;
  -- these are conservative quotas for support messages, not study requests.
  if v_client >= 5 or v_total >= 250 or v_per_minute >= 12 then
    return false;
  end if;
  update public.feedback_request_counters set used = used + 1
    where bucket = v_key and period_start = v_day;
  update public.feedback_request_counters set used = used + 1
    where bucket = 'global:feedback:day' and period_start = v_day;
  update public.feedback_request_counters set used = used + 1
    where bucket = 'global:feedback:minute' and period_start = v_minute;
  return true;
end;
$feedback_quota$;
revoke all on function public.reserve_feedback_submission(text)
  from public, anon, authenticated;
grant execute on function public.reserve_feedback_submission(text)
  to service_role;
comment on function public.reserve_feedback_submission(text)
  is 'Atomic service-role-only quota for private visitor feedback submissions';
