REVOKE ALL ON FUNCTION public.touch_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_summary(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.is_owner(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM anon;