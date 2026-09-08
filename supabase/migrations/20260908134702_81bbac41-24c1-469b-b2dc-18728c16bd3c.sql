ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS birth_date date;

CREATE TABLE IF NOT EXISTS public.feature_flags (
  tool text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_flags no client access" ON public.feature_flags FOR SELECT TO authenticated USING (false);

INSERT INTO public.feature_flags (tool, enabled) VALUES
  ('essay', true), ('presentation', true), ('tutor', true),
  ('leaderboard', true), ('schedule', true), ('pro', true)
ON CONFLICT (tool) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS admins_username_key ON public.admins (username);

INSERT INTO public.admins (username) VALUES ('555683731'), ('557099944')
ON CONFLICT (username) DO NOTHING;