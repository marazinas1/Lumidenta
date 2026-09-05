CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  archived_at timestamptz
);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 255
    AND (phone IS NULL OR length(phone) <= 50)
    AND (message IS NULL OR length(message) <= 4000)
    AND (source IS NULL OR length(source) <= 120)
    AND read_at IS NULL AND archived_at IS NULL
  );

DROP POLICY IF EXISTS "Staff read leads" ON public.leads;
CREATE POLICY "Staff read leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update leads" ON public.leads;
CREATE POLICY "Staff update leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);

CREATE OR REPLACE FUNCTION public.analytics_summary(_from date, _to date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  span int := GREATEST((_to - _from) + 1, 1);
  prev_from date := _from - span;
  prev_to date := _from - 1;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Neturite prieigos.';
  END IF;

  WITH cur AS (
    SELECT * FROM public.page_views
    WHERE created_at >= _from::timestamptz AND created_at < (_to + 1)::timestamptz
  ), prev AS (
    SELECT * FROM public.page_views
    WHERE created_at >= prev_from::timestamptz AND created_at < (prev_to + 1)::timestamptz
  )
  SELECT jsonb_build_object(
    'totals', jsonb_build_object(
      'views', (SELECT count(*) FROM cur),
      'visitors', (SELECT count(DISTINCT session_id) FROM cur)
    ),
    'previous', jsonb_build_object(
      'views', (SELECT count(*) FROM prev),
      'visitors', (SELECT count(DISTINCT session_id) FROM prev)
    ),
    'daily', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'day')
      FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD'),
          'views', count(*),
          'visitors', count(DISTINCT session_id)
        ) AS x
        FROM cur GROUP BY 1
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('path', path, 'views', count(*)) AS x
        FROM cur GROUP BY path ORDER BY count(*) DESC LIMIT 10
      ) p
    ), '[]'::jsonb),
    'sources', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('source', s, 'views', count(*)) AS x
        FROM (
          SELECT CASE
            WHEN referrer = '' THEN 'direct'
            WHEN referrer ILIKE '%google%' THEN 'google'
            WHEN referrer ILIKE '%bing%' OR referrer ILIKE '%duckduckgo%' OR referrer ILIKE '%yahoo%' THEN 'search'
            WHEN referrer ILIKE '%facebook%' THEN 'facebook'
            WHEN referrer ILIKE '%instagram%' THEN 'instagram'
            ELSE 'other' END AS s
          FROM cur
        ) t GROUP BY s ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('device', d, 'views', count(*)) AS x
        FROM (
          SELECT CASE
            WHEN user_agent ILIKE '%ipad%' OR user_agent ILIKE '%tablet%' THEN 'tablet'
            WHEN user_agent ILIKE '%mobi%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%' THEN 'mobile'
            WHEN user_agent = '' THEN 'unknown'
            ELSE 'desktop' END AS d
          FROM cur
        ) t GROUP BY d ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb),
    'leads', (SELECT count(*) FROM public.leads
      WHERE created_at >= _from::timestamptz AND created_at < (_to + 1)::timestamptz)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_summary(date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.analytics_summary(date, date) TO authenticated;