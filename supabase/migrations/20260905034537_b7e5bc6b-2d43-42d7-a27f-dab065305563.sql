CREATE OR REPLACE FUNCTION public.analytics_summary(_from date, _to date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      SELECT jsonb_agg(jsonb_build_object('day', d.day, 'views', d.views, 'visitors', d.visitors) ORDER BY d.day)
      FROM (
        SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
               count(*) AS views,
               count(DISTINCT session_id) AS visitors
        FROM cur
        GROUP BY 1
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('path', p.path, 'views', p.views))
      FROM (
        SELECT path, count(*) AS views
        FROM cur GROUP BY path ORDER BY count(*) DESC LIMIT 10
      ) p
    ), '[]'::jsonb),
    'sources', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('source', q.s, 'views', q.views))
      FROM (
        SELECT s, count(*) AS views
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
      SELECT jsonb_agg(jsonb_build_object('device', q.d, 'views', q.views))
      FROM (
        SELECT d, count(*) AS views
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
$function$;