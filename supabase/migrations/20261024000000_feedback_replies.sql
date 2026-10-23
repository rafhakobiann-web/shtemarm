-- Replies to feedback. Users keep a random client_id in their browser and see their own
-- messages and replies through a server function. The site owner reads and replies in /admin/feedback.
alter table public.feedback add column if not exists client_id text
  check (client_id is null or char_length(client_id) between 8 and 100);
alter table public.feedback add column if not exists reply text
  check (reply is null or char_length(reply) <= 4000);
alter table public.feedback add column if not exists replied_at timestamptz;

create index if not exists feedback_client_id_idx on public.feedback (client_id);
