CREATE POLICY "Public read site images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');

CREATE POLICY "Staff upload site images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff update site images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff delete site images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));