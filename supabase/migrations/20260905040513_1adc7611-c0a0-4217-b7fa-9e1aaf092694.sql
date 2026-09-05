-- Content tables: staff can read everything, only owner/developer can write.

-- services
DROP POLICY IF EXISTS "Staff manage services" ON public.services;
CREATE POLICY "Owners manage services" ON public.services FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- testimonials
DROP POLICY IF EXISTS "Staff manage testimonials" ON public.testimonials;
CREATE POLICY "Owners manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- posts
DROP POLICY IF EXISTS "Staff manage posts" ON public.posts;
CREATE POLICY "Owners manage posts" ON public.posts FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- page_text
DROP POLICY IF EXISTS "Staff manage page text" ON public.page_text;
CREATE POLICY "Owners manage page text" ON public.page_text FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- page_media
DROP POLICY IF EXISTS "Staff manage page media" ON public.page_media;
CREATE POLICY "Owners manage page media" ON public.page_media FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- site_settings
DROP POLICY IF EXISTS "Staff manage site settings" ON public.site_settings;
CREATE POLICY "Owners manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- Storage: only owner/developer may write site images; everyone may read.
DROP POLICY IF EXISTS "Staff manage site images" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Staff update site images" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete site images" ON storage.objects;
DROP POLICY IF EXISTS "Owners manage site images" ON storage.objects;
CREATE POLICY "Owners manage site images" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'site-images' AND public.is_owner(auth.uid()))
  WITH CHECK (bucket_id = 'site-images' AND public.is_owner(auth.uid()));