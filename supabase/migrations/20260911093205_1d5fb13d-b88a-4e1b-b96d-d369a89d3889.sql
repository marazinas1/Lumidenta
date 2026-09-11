ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS engaged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_ms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS page_views_country_idx ON public.page_views (country_code);
CREATE INDEX IF NOT EXISTS page_views_engaged_idx ON public.page_views (created_at DESC) WHERE engaged AND NOT is_bot;

-- Recording now happens server-side (service role) so the country header can be read
-- and robots rejected. Browsers must no longer insert directly.
REVOKE INSERT ON public.page_views FROM anon;
REVOKE INSERT ON public.page_views FROM authenticated;
DROP POLICY IF EXISTS "Anyone can record a page view" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
GRANT ALL ON public.page_views TO service_role;

DROP FUNCTION IF EXISTS public.analytics_summary(date, date);

CREATE OR REPLACE FUNCTION public.analytics_summary(
  _from date,
  _to date,
  _include_short boolean DEFAULT false
)
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
      AND is_bot = false
      AND (_include_short OR engaged = true)
  ), prev AS (
    SELECT * FROM public.page_views
    WHERE created_at >= prev_from::timestamptz AND created_at < (prev_to + 1)::timestamptz
      AND is_bot = false
      AND (_include_short OR engaged = true)
  ), sessions AS (
    SELECT session_id, count(*) AS views, sum(duration_ms) AS total_ms
    FROM cur GROUP BY session_id
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
    'avg_duration_ms', COALESCE((SELECT round(avg(total_ms))::int FROM sessions), 0),
    'bounce_rate', COALESCE((
      SELECT round(100.0 * count(*) FILTER (WHERE views = 1) / NULLIF(count(*), 0))::int
      FROM sessions
    ), 0),
    'pages_per_visit', COALESCE((SELECT round(avg(views), 1) FROM sessions), 0),
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
    'countries', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object(
          'code', CASE WHEN country_code = '' THEN 'XX' ELSE upper(country_code) END,
          'views', count(*),
          'visitors', count(DISTINCT session_id)
        ) AS x
        FROM cur
        GROUP BY 1 ORDER BY count(*) DESC LIMIT 12
      ) c
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
            ELSE 'other'
          END AS s
          FROM cur
        ) t
        GROUP BY s ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('device', d, 'views', count(*)) AS x
        FROM (
          SELECT CASE
            WHEN user_agent ILIKE '%ipad%' OR user_agent ILIKE '%tablet%' THEN 'tablet'
            WHEN user_agent ILIKE '%mobi%' OR user_agent ILIKE '%iphone%' OR user_agent ILIKE '%android%' THEN 'mobile'
            WHEN user_agent = '' THEN 'unknown'
            ELSE 'desktop'
          END AS d
          FROM cur
        ) t
        GROUP BY d ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb),
    'leads', (
      SELECT count(*) FROM public.leads
      WHERE created_at >= _from::timestamptz AND created_at < (_to + 1)::timestamptz
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.prune_page_views()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.page_views WHERE created_at < now() - interval '14 months';
$$;

REVOKE ALL ON FUNCTION public.prune_page_views() FROM public;
GRANT EXECUTE ON FUNCTION public.prune_page_views() TO service_role;