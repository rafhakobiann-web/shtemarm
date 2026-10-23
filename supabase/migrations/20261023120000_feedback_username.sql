-- Feedback now carries a username instead of contact details. Only the owner
-- can read rows (Supabase dashboard); the public can insert only.
alter table public.feedback drop column if exists contact;
alter table public.feedback add column if not exists username text not null default 'անանուն' check (char_length(username) between 1 and 40);
alter table public.feedback alter column username drop default;
