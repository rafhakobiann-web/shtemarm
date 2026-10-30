# Shtemarm support / feedback deployment checklist

The public support page is `/feedback`. The private reply dashboard is `/admin/feedback`.

## Required server-only environment variables

- `SUPABASE_URL`: URL for the Supabase project **containing** `public.feedback`.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase key for that project; never prefix with `VITE_` or expose in browser.
- `ADMIN_PASSWORD`: strong server-only admin password for the reply dashboard.
- `ADMIN_EMAIL`: email of a confirmed Supabase Auth account allowed to administer feedback. The admin must sign in at `/auth` first; both account session and admin password are required.

Set these in the **actual deployed server environment** (e.g. Vercel project settings), including Preview/Production as appropriate, then redeploy. Having the table in Lovable Cloud does not imply that Vercel is connected to the same database.

## Database schema

```sql
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact text,
  client_id text not null,
  reply text,
  created_at timestamptz not null default now(),
  replied_at timestamptz
);
create index if not exists feedback_client_id_idx on public.feedback (client_id);
create index if not exists feedback_client_created_idx on public.feedback (client_id, created_at desc);
alter table public.feedback enable row level security;
```

Do not add public SELECT or INSERT RLS policies. All database operations occur server-side; the service-role key must remain private.

## Manual end-to-end acceptance

1. Visit `/feedback` in a fresh browser and submit a non-sensitive test message.
2. Confirm the message appears in the same browser's history. Sending another message within one minute should be rejected.
3. Visit `/admin/feedback`, enter the admin password, and reply.
4. Refresh `/feedback` in the original browser and confirm the reply appears.
5. Test wrong admin password and temporarily missing server configuration. Verify no secrets or raw database error details appear in the browser.
6. Check that a different browser does not see the first browser's messages.

**Security note:** the browser token is a bearer identifier, not authenticated user ownership. Anyone who obtains it can retrieve that browser's feedback. Avoid sensitive personal information; future migration to authenticated user accounts is recommended. The one-minute throttle is per client token and is not a global abuse defense.
