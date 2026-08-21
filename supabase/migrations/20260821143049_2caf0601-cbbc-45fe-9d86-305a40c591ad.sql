CREATE TABLE public.flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  text text NOT NULL,
  word text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.flags TO service_role;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags no client access" ON public.flags FOR SELECT TO authenticated USING (false);

CREATE TABLE public.strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  reason text NOT NULL DEFAULT 'bad_language',
  until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX strikes_username_idx ON public.strikes (username, until DESC);
GRANT ALL ON public.strikes TO service_role;
ALTER TABLE public.strikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strikes no client access" ON public.strikes FOR SELECT TO authenticated USING (false);

CREATE TABLE public.admins (
  username text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins no client access" ON public.admins FOR SELECT TO authenticated USING (false);

CREATE TABLE public.presence (
  username text PRIMARY KEY,
  last_seen timestamptz NOT NULL DEFAULT now(),
  first_seen timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.presence TO service_role;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presence no client access" ON public.presence FOR SELECT TO authenticated USING (false);

CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (username, day)
);
GRANT ALL ON public.visits TO service_role;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visits no client access" ON public.visits FOR SELECT TO authenticated USING (false);

INSERT INTO public.admins (username) VALUES ('aleksandre'), ('nini') ON CONFLICT DO NOTHING;