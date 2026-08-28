# Step 1 — Carve-out

Deletion only. No new pages, components, or Lumidenta content. End state: the project builds and previews with a minimal homepage, and a case-insensitive search for "rentivo" or "dharma" returns hits only in AGENTS.md and PLAN.md.

## What gets deleted

**Rentivo / Core-client layer**
- `src/lib/rentivo-api.server.ts`, `rentivo.functions.ts`, `rentivo-schemas.ts`
- `src/lib/availability.server.ts`, `availability-queries.ts`, `availability-schemas.ts`
- `src/lib/property-category.ts`, `property-queries.ts`, `property-slug.ts`, `property-view.ts`
- `src/components/stay/`, `src/components/home/StaysSection.tsx`
- `src/components/site/BookingDialog.tsx`, `booking-context.ts`, `src/lib/booking-storage.ts`
- `src/components/admin/settings/ApiAccessSection.tsx`
- All `RENTIVO_*` logic in `src/lib/runtime-env.server.ts` (generic env helpers kept only if something still imports them)
- `.lovable/plan/*.md`, `src/assets/logo-dharma.png` (+ any `.asset.json`), `src/components/site/Enso.tsx`

**Hotel pages and routes** (LT and `/en`)
- `src/pages/`: `apartamentai-*`, `banketine-sale`, `restobaras`, `sauna`, `dovanu-kuponai`, `rezervacija-patvirtinta`, `redirect-to-stays`, `legal`-related hotel copy where it only served deleted pages
- `src/routes/`: `apartamentai*`, `banketine-sale`, `restobaras`, `sauna`, `dovanu-kuponai`, `namelis`, `rezervacija.patvirtinta` and every `src/routes/en/` equivalent
- `src/routes/_authenticated/`: `admin.bookings.*`, `admin.housekeeping`, `admin.contracts`, `admin.expenses`, `admin.properties.*`, `staff.*`

**Extra files the same rules cover** (they exist only to serve the deleted layer, so leaving them would break the build or keep hotel code alive)
- `src/lib/`: `bookings.functions.ts`, `booking-extras.ts`, `booking-pricing.ts`, `properties.ts`, `properties.functions.ts`, `property-settings*.ts`, `housekeeping.*`, `invoices.*`, `invoice-pdf.ts`, `contracts.functions.ts`, `ical*.ts`, `operations.functions.ts`, `dashboard.functions.ts`/`dashboard-period.ts` (rewired or removed with the admin dashboard), `api-auth.server.ts`, `api-keys.functions.ts`, `api-public.server.ts`, `staff-api-*.ts`, `banks.ts`
- `src/components/admin/`: `BookingForm`, `BookingsGantt`, `BookingsTimeline`, `PropertyForm`, `InvoiceViewerDialog`, `PdfPreview`, and the invoice/integrations settings sections tied to deleted tables
- Hotel content bundles under `src/content/lt/` and `src/content/en/` (`apartamentai`, `banketineSale`, `restobaras`, `sauna`, `dovanuKuponai`, `rezervacija`, plus Dharma-specific strings in `home`, `kontaktai`, `apie`, `taisykles`, `legal`, `common`) and their `index.ts` exports
- Hotel API routes under `src/routes/api/` that call the deleted modules
- Dharma references in `src/data/contact.ts`, `src/data/nav.ts`, `src/routes/sitemap[.]xml.ts`, `README.md`, `migrate.py`, `docs/*.md`

## Imports that must be fixed, not left dangling

- `src/components/site/ContactForm.tsx` — drop the `sendContactMessageFn` import from `rentivo.functions`; the submit handler becomes a local stub (no backend call) until the `leads` table exists in step 2. Its hardcoded "Dharma" email subject text goes too.
- `src/components/site/LegalDocument.tsx` — replace the `LegalDocument` type imported from `rentivo-schemas` with a local type declared in the file.
- `src/components/site/Logo.tsx` — deleted entirely (imports `logo-dharma.png.asset.json`, defaults title to "Dharma Stay"). A real Logo arrives in the design step; every usage in `src/components/site/SiteHeader.tsx` and `src/components/site/SiteFooter.tsx` is replaced with a plain text "Lumidenta" wordmark placeholder.

## Schema.org / "Dharma" cleanup on surviving pages

- `src/pages/kontaktai.tsx` — remove the entire hardcoded JSON-LD `scripts` block (`@type`: "LodgingBusiness", name: "Dharma Stay", address, priceRange). Replaced in step 7 once real practice data exists.
- `src/pages/home.tsx` — explicitly remove the JSON-LD `scripts` block in the same pass; do not rely on the page placeholder reduction to drop it accidentally.

## Remaining "Dharma" strings to edit (files that survive)


- `src/lib/users.functions.ts` — invite email subject and body
- `src/lib/auth-recovery.functions.ts` — password reset email subject
- `src/components/home/LocationMap.tsx` — hardcoded aria-label
- `src/lib/content-templates.ts` — default placeholder values
- `src/lib/locale.ts` — `LOCALE_COOKIE` renamed from `dharma_locale` to `lumidenta_locale`

Brand strings become neutral/Lumidenta wording only — no new content or claims.

## Database migration

One migration dropping (cascade): `properties`, `property_documents`, `property_events`, `property_investments`, `property_maintenance`, `property_settings`, `bookings`, `booking_notifications`, `cars`, `car_investments`, `car_maintenance`, `housekeeping_comments`, `housekeeping_tasks`, `invoices`, `payment_transactions`, `contract_templates`, `signed_contracts`, `room_status`, `api_clients`, `api_request_log`, `app_secrets`, `expenses`, plus the now-orphaned functions that reference them (`get_active_booked_dates`, `get_property_booked_dates`, `admin_get_door_code`, `claim_invoice_number`, `cancel_expired_pending_bookings`, `set_booking_number`, `create_room_status_for_property`, `set_api_clients_updated_at`, `set_property_settings_updated_at`, `touch_room_status_updated_at`, `ensure_single_active_template` if unused).


Note: `site_settings` and `leads` do not exist in the database yet — they are created in step 2, not here. `user_roles`, `has_role()`, `content_templates`, `content_translations`, `page_views` are untouched.

## Kept untouched

Auth setup, `user_roles`, `has_role()`, `src/lib/locale.ts` + i18n plumbing, `image-optimize.ts`, `seo.ts`, the sitemap route pattern, `__root.tsx`, `error-page.ts`, `error-capture.ts`.

## Fix-ups after deletion

- Home page reduced to a minimal placeholder shell; hotel sections (`AvailabilityBand`, `BookingBand`, `ExtrasSection`, `Ratings`, `LocationSection`, `IntroStrip`, `Hero`) removed or emptied of hotel copy.
- Header, footer, and `src/data/nav.ts` stripped of links to deleted routes.
- Admin shell kept with only the surviving sections (dashboard placeholder, content, settings, users); nav entries for deleted admin routes removed.
- Sitemap emits only surviving routes.
- Typecheck + a preview load of `/` and `/admin` to confirm no dangling imports or dead routes remain.
