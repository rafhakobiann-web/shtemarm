-- Stored AI explanations for official answer keys. Written only by the admin
-- server functions (service role). Students may read rows that a reviewer has
-- marked as reviewed; everything else stays private.
create table if not exists public.question_explanations (
  bank text not null check (char_length(bank) between 1 and 100),
  question_id text not null check (char_length(question_id) between 1 and 200),
  explanation text not null check (char_length(explanation) between 1 and 6000),
  correct text not null check (char_length(correct) between 1 and 20),
  provider text not null,
  reviewed boolean not null default false,
  generated_at timestamptz not null default now(),
  primary key (bank, question_id)
);

alter table public.question_explanations enable row level security;
revoke all on table public.question_explanations from anon, authenticated;
grant select (bank, question_id, explanation, correct) on public.question_explanations to anon, authenticated;

create policy "reviewed explanations are readable"
  on public.question_explanations
  for select
  to anon, authenticated
  using (reviewed = true);
