ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS includes_heading text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pre_booking_message text NOT NULL DEFAULT '';