CREATE TABLE public.page_text_defaults (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL,
  slot text NOT NULL,
  locale text NOT NULL DEFAULT 'lt',
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot, locale)
);

GRANT SELECT ON public.page_text_defaults TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_text_defaults TO authenticated;
GRANT ALL ON public.page_text_defaults TO service_role;

ALTER TABLE public.page_text_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read text defaults" ON public.page_text_defaults
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Developer manages text defaults" ON public.page_text_defaults
  FOR ALL TO authenticated
  USING (public.is_developer(auth.uid()))
  WITH CHECK (public.is_developer(auth.uid()));

CREATE TRIGGER page_text_defaults_updated_at
  BEFORE UPDATE ON public.page_text_defaults
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.default_text_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL,
  slot text NOT NULL,
  locale text NOT NULL DEFAULT 'lt',
  requested_text text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  requested_by uuid NOT NULL,
  resolved_by uuid,
  resolved_at timestamptz,
  seen_by_requester boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.default_text_requests TO authenticated;
GRANT ALL ON public.default_text_requests TO service_role;

ALTER TABLE public.default_text_requests ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX default_text_requests_one_pending
  ON public.default_text_requests (page, slot, locale)
  WHERE status = 'pending';

CREATE POLICY "Own or developer read requests" ON public.default_text_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.is_developer(auth.uid()));

CREATE POLICY "Owners can request defaults" ON public.default_text_requests
  FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() AND public.is_owner(auth.uid()));

CREATE POLICY "Developer resolves requests" ON public.default_text_requests
  FOR UPDATE TO authenticated
  USING (public.is_developer(auth.uid()))
  WITH CHECK (public.is_developer(auth.uid()));

CREATE POLICY "Requester marks requests seen" ON public.default_text_requests
  FOR UPDATE TO authenticated
  USING (requested_by = auth.uid())
  WITH CHECK (requested_by = auth.uid());

CREATE TRIGGER default_text_requests_updated_at
  BEFORE UPDATE ON public.default_text_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();