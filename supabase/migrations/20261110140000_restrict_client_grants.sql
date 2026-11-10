-- Shtemarm defense in depth: restrict DB roles to the minimum privileges.
-- No rows are removed, no progress IDs are migrated, and service-role grants
-- are intentionally left unchanged. Safe to re-apply.
BEGIN;

-- The explanation cache is accessed only through server-only Supabase service
-- role; browser callers do not require any direct table privileges.
ALTER TABLE public.explanation_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.explanation_cache
  FROM PUBLIC, anon, authenticated;

-- Learners need only to read, upsert and update their own progress.
-- Existing owner-only RLS policies remain in force and must not be dropped.
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.user_progress
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_progress TO authenticated;

-- Explicitly prevent direct client read/write of private support submissions.
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.feedback FROM PUBLIC, anon, authenticated;

COMMIT;

-- Manual verification (run with a privileged SQL console after deploy):
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname IN
-- ('explanation_cache','user_progress','feedback');
-- SELECT has_table_privilege('anon','public.user_progress','SELECT');
-- SELECT has_table_privilege('authenticated','public.user_progress','UPDATE');
-- Expected: false and true respectively. Confirm RLS cross-account denial.
