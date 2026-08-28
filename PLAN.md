# PLAN.md — Lumidenta build sequence

High-level roadmap. Each numbered step is its own Lovable prompt (plan mode for anything structural), verified against GitHub before moving to the next. See AGENTS.md for the rules governing all of them — this file is the order, not the constraints.

## 1. Carve-out
Remove everything listed under AGENTS.md rules #1–2: the Rentivo/Core-client layer, hotel-specific pages/routes/components, and the matching Supabase tables. End state: project builds and previews cleanly, zero property/booking/rental code left, zero mention of Rentivo or Dharma anywhere in the repo (code, assets, or `.lovable/plan` history).

## 2. Data model
Create `site_settings`, `services`, `working_hours`, `schedule_exceptions`, `appointments`, `leads`. Reuse the `leads` shape and RLS pattern already proven in Halliday Architects. Roles: `developer`/`owner`/`editor` enum, invite + `/admin/set-password` flow ported from OCDG/HA.

## 3. Design direction
Full HTML mockup for approval before any Lovable prompt touches the homepage — hero, about section, one service card, one service subpage. Frontend-design skill consulted here. Palette and type locked at this step, not renegotiated later.

## 4. Public pages
Home, Apie mane, Paslaugos (overview), individual SEO service pages (dantų plombavimas, estetinis plombavimas, danties atstatymas po šaknų kanalų gydymo, odontologo konsultacija), Kainos, D.U.K., Kontaktai. Each page: one H1, unique title/description, canonical, JSON-LD, internal links between related services.

## 5. Booking flow (public)
Service → available slot (computed from `working_hours` minus existing `confirmed`/`pending` `appointments`) → contact details → submitted as `pending` → confirmation screen + email notification to Erika. No account required for the patient.

## 6. Admin panel
Services editor, working-hours/exceptions editor, appointments inbox (list, filter by status, confirm/decline), photo manager (about photo, service images) through the upload pipeline, site settings (contact info, license numbers once confirmed).

## 7. SEO technical layer
Sitemap, robots.txt, OG/Twitter metadata, favicon, schema.org (`Dentist`/`MedicalBusiness`, `Person` for Erika, `FAQPage`) — no fabricated ratings or review schema.

## 8. Legal
Privatumo politika, Slapukų politika, real ASPĮ and OPL numbers once Erika confirms them.

## 9. Launch
DNS cutover from the WordPress site to wherever this is ultimately hosted (confirm hosting target before this step), 301s from any indexed old URLs, remove `noindex`, submit to Google Search Console.

---

## Open questions for Erika
Needed before step 2 can be called finished, not before step 1 starts:

- Exact legal name + OPL license number (see AGENTS.md discrepancy note)
- Full service list with realistic durations per service
- Weekly working hours at Braškių g. 2B-1
- Appointment requests: manually confirmed at first, or move to instant confirmation later?
- ASPĮ license holder name/number for the practice
