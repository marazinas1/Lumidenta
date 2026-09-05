-- 1. Role enum cleanup: keep developer/owner/editor only
-- CASCADE clears stale storage.objects policies left over from the previous project
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;

ALTER TYPE public.app_role RENAME TO app_role_old;

CREATE TYPE public.app_role AS ENUM ('developer', 'owner', 'editor');

UPDATE public.user_roles SET role = 'developer'::public.app_role_old WHERE role::text = 'admin';
DELETE FROM public.user_roles WHERE role::text IN ('user', 'housekeeper');

ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

DROP TYPE public.app_role_old;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('developer'::public.app_role, 'owner'::public.app_role, 'editor'::public.app_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('developer'::public.app_role, 'owner'::public.app_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_developer(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'developer'::public.app_role
  )
$$;

-- 2. Editable page text
CREATE TABLE public.page_text (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  locale text NOT NULL DEFAULT 'lt',
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot, locale)
);

GRANT SELECT ON public.page_text TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_text TO authenticated;
GRANT ALL ON public.page_text TO service_role;

ALTER TABLE public.page_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page text" ON public.page_text
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage page text" ON public.page_text
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER page_text_touch BEFORE UPDATE ON public.page_text
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Owner-chosen images
CREATE TABLE public.page_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  bucket text NOT NULL DEFAULT 'site-images',
  path text NOT NULL,
  alt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot)
);

GRANT SELECT ON public.page_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media TO authenticated;
GRANT ALL ON public.page_media TO service_role;

ALTER TABLE public.page_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page media" ON public.page_media
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage page media" ON public.page_media
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER page_media_touch BEFORE UPDATE ON public.page_media
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. Developer-pinned defaults
CREATE TABLE public.page_media_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  bucket text NOT NULL DEFAULT 'site-images',
  path text NOT NULL,
  alt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot)
);

GRANT SELECT ON public.page_media_defaults TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media_defaults TO authenticated;
GRANT ALL ON public.page_media_defaults TO service_role;

ALTER TABLE public.page_media_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media defaults" ON public.page_media_defaults
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Developer manages media defaults" ON public.page_media_defaults
  FOR ALL TO authenticated USING (public.is_developer(auth.uid())) WITH CHECK (public.is_developer(auth.uid()));

CREATE TRIGGER page_media_defaults_touch BEFORE UPDATE ON public.page_media_defaults
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();