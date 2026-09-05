CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Working hours: weekly recurring pattern. weekday 1 = Monday .. 7 = Sunday.
CREATE TABLE public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_min smallint NOT NULL CHECK (start_min >= 0 AND start_min <= 1440),
  end_min smallint NOT NULL CHECK (end_min >= 0 AND end_min <= 1440),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT working_hours_range CHECK (end_min > start_min)
);
GRANT SELECT ON public.working_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.working_hours TO authenticated;
GRANT ALL ON public.working_hours TO service_role;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read working hours" ON public.working_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage working hours" ON public.working_hours FOR ALL TO authenticated USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));
CREATE TRIGGER working_hours_touch BEFORE UPDATE ON public.working_hours FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Schedule exceptions: one-off closures or extra opening hours for a date.
CREATE TABLE public.schedule_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  kind text NOT NULL DEFAULT 'closed' CHECK (kind IN ('closed', 'open')),
  start_min smallint CHECK (start_min >= 0 AND start_min <= 1440),
  end_min smallint CHECK (end_min >= 0 AND end_min <= 1440),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schedule_exceptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_exceptions TO authenticated;
GRANT ALL ON public.schedule_exceptions TO service_role;
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read schedule exceptions" ON public.schedule_exceptions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage schedule exceptions" ON public.schedule_exceptions FOR ALL TO authenticated USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));
CREATE TRIGGER schedule_exceptions_touch BEFORE UPDATE ON public.schedule_exceptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Appointments. Patient data is staff-only; the public site reads busy
-- intervals through a server function, never these rows directly.
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_title text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  patient_name text NOT NULL DEFAULT '',
  patient_phone text NOT NULL DEFAULT '',
  patient_email text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','arrived','no_show','cancelled')),
  kind text NOT NULL DEFAULT 'appointment' CHECK (kind IN ('appointment','block')),
  source text NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_range CHECK (ends_at > starts_at),
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status IN ('pending','confirmed'))
);
CREATE INDEX appointments_starts_at_idx ON public.appointments (starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Owners manage appointments" ON public.appointments FOR ALL TO authenticated USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));
CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Services gain a default duration and a bookable flag.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS duration_min smallint NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS bookable boolean NOT NULL DEFAULT true;