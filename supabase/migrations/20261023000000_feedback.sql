-- Feedback from the site. Anyone can send a message; nobody can read the table
-- through the public API. Read it in the Supabase dashboard (or with the service role).
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "anyone can send feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);
