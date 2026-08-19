CREATE TABLE public.app_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL UNIQUE,
  pass_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct client access" ON public.app_users FOR SELECT TO authenticated USING (false);