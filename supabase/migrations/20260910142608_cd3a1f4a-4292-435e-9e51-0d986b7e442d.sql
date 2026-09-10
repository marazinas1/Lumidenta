ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS logo_size integer NOT NULL DEFAULT 48
CHECK (logo_size BETWEEN 32 AND 80);