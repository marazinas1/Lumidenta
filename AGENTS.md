# AGENTS.md — Lumidenta

Rules for any AI agent (Lovable, Claude, or otherwise) working in this repository. Read this before making changes.

---

## Project identity

The website and appointment system for **Lumidenta**, the independent private dental practice of **gyd. odontologė Erika [surname to confirm — see below]**, in Vilnius, Lithuania.

This is a solo practitioner working from a rented dental office, not a clinic with a team. Copy must never say "mūsų klinika," "mūsų gydytojai," "mūsų komanda" — first person or neutral professional wording only ("Atlieku," "Konsultuoju," "Gyd. odontologė ...").

**Name to confirm before it goes anywhere public:** the draft brief refers to "Erika Padij," but a public dentist-directory search found no match for that name. A dentist "Erika Danisevičiūtė" (also listed as "Erika Valentėlė"), license **OPL-05595**, is listed at an address branded "Lumidenta" — almost certainly the same person under a maiden/married name variant. Confirm the exact legal name and license number with Erika directly. Do not put either name into copy, metadata, or schema.org markup until confirmed.

The repository was remixed from `demo-rentals` (a Dharma/Revoo multi-property hotel-booking platform). Any reference to properties, nightly bookings, apartments, cars, housekeeping, invoices, contracts, or a "Core ↔ Booking Engine" split is leftover from that project and wrong here — this is a single dentist's appointment site, nothing multi-tenant about it.

---

## Hard rules

### 1. Delete the Rentivo / Core-client layer entirely — do not configure it

The base project was built for Revoo, where a separate "Booking Engine" website calls a central "Core" over a public API, authenticated with `RENTIVO_API_KEY` / `RENTIVO_API_URL_*`. Lumidenta has no Core and no second Lovable project calling into it. Remove, don't fill in:

- `src/lib/rentivo-api.server.ts`, `rentivo.functions.ts`, `rentivo-schemas.ts`
- `src/lib/availability.server.ts`, `availability-queries.ts`, `availability-schemas.ts` (nightly-stay availability — appointment-slot availability is new, unrelated code, written from scratch)
- `src/lib/property-*.ts`, `src/components/stay/*`, `src/components/home/StaysSection.tsx`
- `src/components/site/BookingDialog.tsx`, `booking-context.ts`, `src/lib/booking-storage.ts`
- `src/components/admin/settings/ApiAccessSection.tsx`
- Every `RENTIVO_*` reference left in `runtime-env.server.ts`
- `.lovable/plan/*.md` files documenting the old Core/API-key work — historical noise, safe to delete
- `src/assets/logo-dharma.png*`, `src/components/site/Enso.tsx` and any other Dharma-branded asset or component

If Lovable's "Update secret" prompt for `RENTIVO_API_KEY` appears again during setup, **skip it**. Never source a real value for it — it doesn't exist for this project and never will.

### 2. Delete hotel-specific modules and tables, don't adapt them

Pages/routes deleted outright (LT and `/en` mirrors): `apartamentai*`, `restobaras`, `sauna`, `banketine-sale`, `dovanu-kuponai`, `namelis`, `rezervacija-patvirtinta`. Admin routes deleted: `admin.bookings.*`, `admin.housekeeping.tsx`, `admin.contracts.tsx`, `admin.expenses.tsx`, `staff.*`.

Tables not carried forward: `properties`, `property_*`, `bookings`, `booking_notifications`, `cars`, `car_*`, `housekeeping_*`, `invoices`, `payment_transactions`, `contract_templates`, `signed_contracts`, `room_status`, `api_clients`, `api_request_log`, `app_secrets`.

### 3. No client data in migrations

Migrations define structure only. Services, prices, hours, and photos are entered through the admin panel. Nothing about Erika, her real prices, or her real schedule gets hardcoded into a `.sql` file or committed as a seed value.

### 4. Photos always go through the upload pipeline

Erika will replace every placeholder image herself from the admin panel with her own workspace photos — no stock, no AI-generated faces. Every upload runs through `image-optimize.ts` (resize, WebP, EXIF strip). No direct-to-storage paths. Deleting or replacing a photo deletes the old file from storage — sibling projects have had orphaned-file bugs from skipping this step; don't repeat it here.

### 5. Roles

Same three-tier model as every other platform project:
- `developer` — Marius, full access
- `owner` — Erika, edits everything, cannot remove the developer
- `editor` — future staff, content/property edit only, no delete, no user management. Build the enum; don't build the UI for it until a real editor exists.

### 6. Medical-advertising caution

Health-service advertising is regulated (VVTAT oversight). No invented qualifications, graduation years, certificates, prices, reviews, or clinical promises ("be skausmo," "100% garantija," "geriausia"). Placeholder fields for the practice's ASPĮ license number and Erika's OPL license number belong in `site_settings`, filled in only once confirmed — never fabricated in the meantime.

### 7. Contact form stays non-medical

Name, phone or email, short message, privacy consent checkbox. No symptom field, no health-history field, ever.

### 8. Language

`lt` is canonical and the only published locale at launch. Keep the existing `i18n` / `locale.ts` plumbing (it already works) but don't ship `/en` routes until there's real translated content — a half-empty English mirror is a thin-content SEO liability, not a feature.

---

## Data model (new)

| Table | Purpose |
|---|---|
| `site_settings` | Practice name, patient-facing address (kept distinct from any legal registered address), phone, email, ASPĮ/OPL numbers, social links |
| `services` | Name, slug, short/long description, duration in minutes, price display text (placeholder until confirmed), sort order, active flag |
| `working_hours` | Weekly recurring availability pattern |
| `schedule_exceptions` | One-off closures, holidays, vacation |
| `appointments` | service_id, requested slot, patient name, phone, email, note, status (`pending`/`confirmed`/`declined`/`cancelled`), created_at |
| `leads` | General contact-form submissions (non-medical) |
| `user_roles` | developer/owner/editor |

**Booking behaviour:** a submitted appointment request defaults to `pending`, never auto-confirmed — a solo practitioner needs to see it before it's real. Moving to instant self-service confirmation later is Erika's call once she's used the inbox for a while, not a v1 default.

---

## Design direction

Reference `@stagehomy` for visual language, adapted to a healthcare context: restrained palette (warm off-white, charcoal text, muted green/teal accent, small amount of warm beige), generous white space, rounded-but-subtle cards and buttons, no bright medical blue, no dark background as a primary surface. Contemporary, highly readable type. Consult the `frontend-design` skill before writing any homepage or component code — don't default to generic template patterns.

---

## Working method

Clone fresh before each change — Lovable commits directly, a stale local copy is likely wrong. One task per prompt. Plan mode for anything structural. A feature is done when Erika could use it without being taught: if adding a service or answering an appointment request needs explaining, the admin panel isn't finished.

---

## Deployment

Build on a Lovable preview or a temporary subdomain with `noindex` in place — never directly on `lumidenta.lt`, which is currently live (WordPress, maintenance mode) until cutover. Moves to `lumidenta.lt` only at launch, at which point `noindex` and any temporary robots block are removed together.
