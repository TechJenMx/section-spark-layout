CREATE TABLE public.ai_service_state (id text PRIMARY KEY, status integer NOT NULL, message text NOT NULL);
GRANT ALL ON public.ai_service_state TO service_role;
ALTER TABLE public.ai_service_state ENABLE ROW LEVEL SECURITY;