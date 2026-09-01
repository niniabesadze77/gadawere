-- SCORES
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  subject text NOT NULL DEFAULT 'general',
  correct integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scores_username_idx ON public.scores(username);
GRANT ALL ON public.scores TO service_role;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scores no client access" ON public.scores FOR SELECT TO authenticated USING (false);

-- SCHEDULE
CREATE TABLE public.schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  weekday smallint NOT NULL,
  start_time text NOT NULL DEFAULT '09:00',
  subject text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX schedule_username_idx ON public.schedule(username);
GRANT ALL ON public.schedule TO service_role;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule no client access" ON public.schedule FOR SELECT TO authenticated USING (false);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  plan text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'pending',
  payment_code text NOT NULL DEFAULT '',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_username_idx ON public.subscriptions(username);
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions no client access" ON public.subscriptions FOR SELECT TO authenticated USING (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER schedule_updated_at BEFORE UPDATE ON public.schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();