# Lumidenta frontend architecture — foundation step

Your FRONTEND.md is sound and I agree with it almost entirely. This plan adopts it, with four adjustments, and covers only the foundation (steps 1–3 of its build order) so we can verify the fallback layer before converting the whole site.

## Where the project actually stands (verified)

- Database has only `leads`, `page_views`, `user_roles` — no content tables yet.
- `src/pages/home.tsx` is fully hardcoded; services live in a local `const services = [...]`.
- `src/routes/index.tsx`, `apie`, `kontaktai` have **no loaders** — nothing is fetched server-side.
- Admin website pages (`admin.website.home/about/services/contact`) all render `AdminPlaceholder`.
- `app_role` still carries `admin`, `user`, `housekeeper` from the old project.

## Adjustments to FRONTEND.md

1. **Locale-safe slots.** Pages render under both the LT tree and `/en`, through shared modules in `src/pages/`. `page_text` needs a `locale` column (`lt` default) from day one, with LT falling back when an EN row is missing — cheaper now than a migration later. `page_media` stays locale-free (same photo both languages).
2. **Shared-module loaders.** Because `src/pages/*.tsx` export a `homeRoute(locale)` factory used by two route files, the loader goes into that factory, not into each route file — one place, both trees stay in sync.
3. **`touch_points`** should be plain numbered slots (`touch_point1` … `touch_point4`), not JSON. JSON in a text slot is an editing trap for a non-technical owner.
4. **`app_role` cleanup ordering.** Dropping `admin` from the enum needs the existing `admin` role row remapped to `developer` first, and `is_staff()` is still referenced by the `leads`/`page_views` policies and `analytics_summary`, so it gets rewritten rather than dropped.

## What this step delivers

**Migration**
- `page_text (page, slot, locale, value)`, `page_media (page, slot, bucket, path, alt)`, `page_media_defaults (…)` — public read, staff write, developer-only write on defaults.
- `app_role` cleanup: keep `developer`, `owner`, `editor`; remap and drop the rest; rewrite `is_staff`/`is_owner`.
- Structure only, no content rows (AGENTS.md #3).
- Storage bucket `site-images` (public read, staff write) created via the storage tool.

**Content layer**
- `src/lib/page-content.functions.ts` — public server fn returning all text + media + defaults in one call.
- `src/lib/usePageContent.ts` — `copy(page, slot, fallback)` and `image(page, slot)` with the three-layer resolution: client value → developer default → code fallback.
- Loaders added to home, apie, kontaktai, legal so content is in the SSR HTML, not fetched after hydration.

**Home conversion (checkpoint)**
- Every visible string in `home.tsx` wrapped in `copy()` with its current wording as fallback; hero and human-touch photos through `image()`.
- Verification: with an empty database the homepage must render byte-identically to today. That is the gate for everything after.

**Admin — Svetainė → Pradžia**
- Replace the placeholder with a real editor: text slots grouped by section, image slots with upload through `optimizeImage` → `site-images`, "Atstatyti numatytąjį" per field, and a developer-only "Prisegti kaip numatytąjį" control. Old storage objects deleted on replace/clear.

## Not in this step

Services table and `/paslaugos/$slug`, prices, testimonials, FAQ, `site_settings`, About/Contact conversion. Each is a separate prompt once the checkpoint passes.

## Open questions for Erika (blockers later, not now)

OPL and ASPĮ licence numbers, working hours, and the six unpublished price categories. Nothing gets invented in the meantime.

## Also

FRONTEND.md gets committed to the repo root next to AGENTS.md and PLAN.md as part of this step.
