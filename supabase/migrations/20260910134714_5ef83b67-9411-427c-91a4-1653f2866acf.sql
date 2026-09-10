CREATE TABLE public.price_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.price_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_groups TO authenticated;
GRANT ALL ON public.price_groups TO service_role;

ALTER TABLE public.price_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published price groups" ON public.price_groups
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all price groups" ON public.price_groups
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Owners manage price groups" ON public.price_groups
  FOR ALL TO authenticated USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

CREATE TABLE public.price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.price_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  price_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX price_items_group_idx ON public.price_items (group_id, sort_order);

GRANT SELECT ON public.price_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_items TO authenticated;
GRANT ALL ON public.price_items TO service_role;

ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published price items" ON public.price_items
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all price items" ON public.price_items
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Owners manage price items" ON public.price_items
  FOR ALL TO authenticated USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

CREATE TRIGGER update_price_groups_updated_at BEFORE UPDATE ON public.price_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER update_price_items_updated_at BEFORE UPDATE ON public.price_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();