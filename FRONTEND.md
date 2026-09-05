# FRONTEND.md — Lumidenta frontend architecture

How pages are built, where every piece of content lives, and what the client can change. Read alongside AGENTS.md (rules) and PLAN.md (order).

---

## 1. The content rule

Every piece of content on this site falls into exactly one of three categories. Putting something in the wrong one is the mistake that makes a CMS painful later, so decide this first, per field.

| If it… | Goes in | Example |
|---|---|---|
| appears on **several pages** and must be edited once | `site_settings` | phone, email, address, licence numbers, logo |
| appears **once, in one place, on one page** | `page_text` / `page_media` | hero heading, the quote card, a checklist line |
| **repeats** as a list of similar things | its own table | services, testimonials, price rows, FAQ |

The test: *if the client would ever want a second one, it needs a table.* A service is not a text slot — she will add a seventh service eventually. The hero heading is not a table — there is only ever one.

---

## 2. Text and image slots

Ported from Halliday Architects, unchanged in shape:

- `page_text` — `(page, slot, value)`
- `page_media` — `(page, slot, bucket, path, alt)` — the client's chosen photograph
- `page_media_defaults` — `(page, slot, bucket, path, alt)` — the developer's pinned default

Resolution order, already implemented in HA's `usePageContent`:

```
image:  client's choice  →  developer default  →  null (component hides the slot)
text:   page_text value  →  fallback string written into the component
```

This is what makes "reset to default" free: deleting the `page_media` row restores the developer's default with no extra table, no undo log, no versioning. Same for text — clear the `page_text` value and the code's fallback shows again.

**Every visible string in a component gets a `copy()` call with the current wording as its fallback.** That way the site is fully rendered before a single row exists in `page_text`, and the client edits from a working starting point rather than empty boxes.

### Slot naming

`page:slot`, lowercase, dot-free, describing the position rather than the current wording — `home:hero_heading`, not `home:dantu_prieziura`. Slot names outlive copy changes.

---

## 3. Page map

Each page lists its editable slots and the tables it reads.

### `/` — Home
| Section | Slots | Tables |
|---|---|---|
| Hero | `hero_eyebrow`, `hero_heading`, `hero_heading_mark`, `hero_lead`, `hero_note`, image `hero_portrait` | — |
| Floating cards | `hero_card1_title`, `hero_card1_text`, `hero_card2_title`, `hero_card2_text` | — |
| Stat bar | `stat1_value`, `stat1_label` … `stat3_*`, `stat_cta_text` | — |
| Services grid | `services_heading`, `services_heading_soft`, `services_lead` | `services` (top 4 by `sort_order`, `published`) |
| Human touch | `touch_eyebrow`, `touch_heading`, `touch_lede`, `touch_quote`, image `touch_photo` | `touch_points` as `page_text` JSON or a small table |
| **Testimonials** | `testimonials_heading` | `testimonials` |
| CTA band | `cta_heading`, `cta_text` | — |

### `/paslaugos` — Services overview
Grid of all published services. Slots: `services_hero_heading`, `services_hero_lead`. Reads `services`.

### `/paslaugos/$slug` — One service (the SEO pages)
Reads a single `services` row: `title`, `slug`, `body` (rich text), `image`, `includes` (JSON list), `faq` (JSON). One H1 per page, own title/description, `MedicalProcedure` or `Service` JSON-LD. These are what rank for "dantų plombavimas Vilniuje" — the reason services must be a table and not slots.

### `/kainos` — Prices
Accordion, mirroring the structure Erika already built: 8 categories, each with rows of `label` + `price_text`. Reads `price_categories` + `price_items`.

`price_text` is free text (`"55€"`, `"100€–130€"`, `"pagal gydymo planą"`) — never a numeric column. Real dental pricing is ranges and conditions, and a `numeric` field forces lies.

Each category also has an optional `note` — Erika's existing "pieninių dantų kanalų negydome" line lives there.

### `/apie` — About
Slots: `about_heading`, `about_body` (rich text), image `about_portrait`, `about_credentials`. Licence numbers pulled from `site_settings`, not typed into the body.

### `/duk` — FAQ
Reads `faq_items` (`question`, `answer`, `sort_order`, `published`). `FAQPage` JSON-LD. Cheap page, disproportionate SEO value.

### `/kontaktai` — Contact
Everything from `site_settings` plus the lead form → `leads`. Slots: `contact_heading`, `contact_lead`.

### Legal
`/privatumo-politika`, `/taisykles` — existing pages, body as rich text in `page_text`.

---

## 4. Tables to add

```
site_settings      singleton: practice_name, dentist_name, phone, email,
                   address_line, district, opl_licence, aspi_licence,
                   facebook_url, logo_path, inquiry_notify_emails

services           id, slug, title, excerpt, body, icon, tone,
                   image_bucket, image_path, includes (jsonb), faq (jsonb),
                   sort_order, published, show_on_home

price_categories   id, title, note, sort_order, published
price_items        id, category_id, label, price_text, sort_order

testimonials       id, quote, author_name, author_detail, source,
                   sort_order, published

faq_items          id, question, answer, sort_order, published

page_text          page, slot, value
page_media         page, slot, bucket, path, alt
page_media_defaults page, slot, bucket, path, alt
```

`published` and `sort_order` on every list table, without exception — the client needs to hide something without deleting it, and to reorder without renaming.

### Cleanup owed

`app_role` still carries `admin`, `user`, `housekeeper` from the Dharma lineage alongside `developer`, `owner`, `editor`. The `is_staff()` function survives with it. Neither is used. Drop them in the same migration that adds the content tables, before any of this gets built on top.

---

## 5. The SSR rule

**Every public route fetches its content in a `loader` before the component renders.** Not in a `useEffect`, not in a bare `useQuery`.

```ts
export const Route = createFileRoute("/")({
  head: () => pageHead({ ... }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: PAGE_CONTENT_KEY,
        queryFn: fetchPageContent,
        staleTime: 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["services"],
        queryFn: fetchPublishedServices,
        staleTime: 5 * 60_000,
      }),
    ]);
  },
  component: Index,
});
```

The component then calls `usePageContent()` and reads from the already-warm cache. Same hook, same code, but the markup Google receives is complete.

Without this the entire SEO case for TanStack Start collapses, and the site becomes a slow SPA with extra steps. A route without a loader is a bug, not a shortcut.

Admin routes are exempt — they are behind auth and not indexed.

---

## 6. Images

One bucket, `site-images`, as in HA. Every upload goes through `optimizeImage` (resize, WebP, EXIF strip) before it reaches storage. Replacing or clearing a slot deletes the old object — orphaned files have bitten sibling projects already.

Port `PageImageSlot` from HA rather than rebuilding: it renders each slot at the same aspect ratio as the live page, shows which of the three layers is currently winning, and gives the developer (and only the developer) the "pin as default" control.

---

## 7. Build order

1. Migration: content tables + `app_role` cleanup
2. `usePageContent` + `fetchPageContent` ported, `loader` added to every existing public route
3. Home converted slot by slot — hero first, verify it still renders identically with an empty database
4. `services` table + admin editor, home grid reads from it
5. `/paslaugos` and `/paslaugos/$slug`
6. `price_categories` / `price_items` + `/kainos`
7. `testimonials` + home section
8. `faq_items` + `/duk`
9. About and Contact converted to slots
10. `site_settings` + admin settings page, licence numbers filled in

Step 3 is the checkpoint that matters: if the homepage renders identically with an empty `page_text`, the fallback layer is correct and everything after it is safe.

---

## 8. Content already available

From Erika's existing site, verified — real, not invented:

- **Name:** gyd. odontologė Erika Padij
- **Bio:** LSMU 2014, 10+ years practising, professional optics in diagnosis and treatment, minimally invasive approach, "mažiau yra geriau", restores rather than extracts where possible
- **Services (8):** terapinis dantų gydymas (didinamoji optika) · burnos ertmės higiena ir profilaktika · dantų balinimas · priekinių dantų estetinis plombavimas · danties kanalų gydymas ir plombavimas (endodontija) · dantų protezavimas · vaikų (nuo 5 m.) dantų gydymas · dantų šalinimas / chirurgija
- **Prices:** children's and surgery categories have complete published price lists; the other six were left collapsed on the old site and need Erika's input
- **Contact:** +370 671 16159 · Lumidenta2@gmail.com · Braškių g. 2B-1, Vilnius (Jeruzalės mikrorajonas)
- **Testimonials:** one published ("Laura") — more needed before the section earns its place

Still missing: OPL licence number, ASPĮ licence number and holder, working hours, the six collapsed price categories.
