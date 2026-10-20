CREATE TABLE public.explanation_cache (
  cache_key text PRIMARY KEY,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.explanation_cache TO service_role;
ALTER TABLE public.explanation_cache ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.explanation_cache IS 'Server-only explanation cache; no browser access or personal identifiers.';