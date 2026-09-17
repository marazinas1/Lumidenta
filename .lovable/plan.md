# Registration CTA refinement and full Deerva standards cleanup

## Goal
Make the registration page’s closing section feel like a natural part of the homepage-led design system, remove the unnecessary Gmail action, and resolve the most important consistency, compliance, accessibility, SEO, and maintainability gaps found across the public website.

## Direct recommendation for the registration CTA
The current block is narrower because `.sched-cta` is capped at 1100px while the homepage and page container use the 1340px grid. It should not remain a separate 1100px island.

Replace it with the same full-width closing-band composition used on the homepage:

- Full width inside the shared 1340px container, with the same 48px desktop / 32px tablet / 20px mobile gutters.
- Left side: “Norite pasitarti pirma?” and one short explanatory paragraph.
- Right side: one primary action, **“Parašyti žinutę →”**, leading directly to the contact form at `/kontaktai#forma`.
- Keep the telephone only as a lower-weight secondary action, visually quieter than the form button.
- Remove the visible Gmail address and `mailto:` button from this block. The address remains managed in settings and may still appear on the Contact page and maintenance screen.
- Stack the actions cleanly on mobile without changing the block’s relationship to the page edges.

## Confirmed audit findings

### Priority 1 — trust, compliance, and broken behavior

1. **The contact form has no privacy-consent checkbox.**
   - This conflicts with the agreed non-medical contact-form specification.
   - Add required consent with a real link to the privacy policy, validate it before submission, and keep the form free of symptom or health-history fields.

2. **The contact form’s failure fallback uses an empty legacy email source.**
   - The normal form works through the backend, but its emergency “write by email” link reads from an empty placeholder module rather than the admin-managed practice email.
   - Read the email from the same site settings source used elsewhere, or hide the fallback when no email exists.

3. **Public footer details are hardcoded.**
   - The practitioner line and address do not follow changes made in admin settings.
   - Build the footer line from `site_settings`; omit any missing or unconfirmed value instead of showing a stale fallback.

4. **English pages are publicly routable despite the launch rule saying Lithuanian only.**
   - `/en` route files, English alternate links, and English sitemap entries are present, while navigation and parts of the copy remain Lithuanian.
   - Keep the locale infrastructure, but stop publishing/indexing `/en` until complete translated content is approved. Remove English alternates from metadata and sitemap meanwhile.

5. **Legal pages currently load no stored document.**
   - Their loader always returns `doc: null`, so the new visual wrapper is consistent but real legal text is not connected.
   - Connect the approved legal content source, preserve sanitization, and keep the shared outer grid with a readable inner text measure.

### Priority 2 — SEO and discoverability before launch

6. **The sitemap is incomplete and static.**
   - It omits registration, articles, service detail pages, and article detail pages, while including unfinished English URLs.
   - Generate it from all real Lithuanian static routes plus published services and articles.

7. **Structured data is incomplete for a dental practice.**
   - Article and one breadcrumb schema exist, but the site lacks the agreed `Dentist` / `MedicalBusiness` structure generated from settings, and service/detail breadcrumbs are inconsistent.
   - Add only verified business data; omit legal name and licence properties until confirmed.

8. **Social-card configuration claims large images without supplying them.**
   - Pages emit `summary_large_image`, but most have no `og:image` / `twitter:image`.
   - Use an absolute public image only where a real page image exists; otherwise use the smaller summary card. Article images can populate both tags when their URL is absolute HTTPS.

9. **Some metadata remains embedded directly in route files.**
   - Centralize page-specific SEO copy so Lithuanian remains consistent and later translation cannot accidentally reuse Lithuanian descriptions.

### Priority 3 — visual-system consistency and accessibility

10. **Two visual systems coexist.**
    - The active public `.luma` system and an unused older page component define overlapping layouts and widths.
    - Remove the unused parallel component and make the active public system the single source of truth.

11. **Public styles bypass the semantic color system in many places.**
    - Colors, shadows, and interaction states are repeatedly hardcoded, and headings use negative letter spacing contrary to the current Deerva standard.
    - Move those values into semantic tokens, keep the existing Lumidenta appearance, and remove raw component-level color literals.

12. **Interactive controls are inconsistent.**
    - Registration selectors, calendar times, form submission, carousel arrows, navigation toggle, and modal actions use separate raw button patterns.
    - Consolidate them into shared button variants without changing booking behavior. Keep one primary action per region, visible keyboard focus, stable dimensions, disabled states, and no hover size shift.

13. **The mobile menu relationship is incomplete for screen readers.**
    - Add a stable menu panel ID and `aria-controls`; preserve `aria-expanded`, route-change closing, and visible focus.

14. **Form fields need stronger associations.**
    - Add stable IDs, explicit labels, field-level error references, and appropriate required states to both contact and appointment forms.

15. **Images need a consistent performance policy.**
    - Several real images have no intrinsic dimensions; the article detail image is neither explicitly eager nor lazy.
    - Store/use dimensions where available, preserve aspect-ratio containers, prioritize only the true first-view image, and lazy-load content below it.

### Priority 4 — content-model and editorial consistency

16. **Visible shared copy is still hardcoded in navigation, footer, registration, errors, and buttons.**
    - Move reusable labels to shared content and page-specific registration text to editable page slots, following the same fallback model as the homepage.
    - Add a Registration texts area in admin because every public page must have editable text.

17. **Potentially sensitive factual fallbacks remain in source.**
    - The code includes the first name, address, graduation year, and experience claims as fallbacks.
    - Continue showing admin-entered verified content, but replace source fallbacks for legal/qualification facts with neutral wording or no output until the owner confirms them.

18. **Contact wording occasionally uses plural voice.**
    - Adjust “Parašykite mums / atsakysime” and similar strings to the approved solo-practitioner voice without changing meaning.

19. **The footer’s Facebook fallback is hardcoded.**
    - Show the social icon only when the admin-managed URL exists; do not silently substitute a second source of truth.

20. **A few existing content rules remain unfinished.**
    - FAQ is documented but has no public page or schema.
    - Treat this as a separate post-launch content feature, not part of the CTA cleanup, unless approved later.

## Implementation sequence

1. **Registration conversion path**
   - Replace the narrow CTA with the shared full-width closing band.
   - Add `/kontaktai#forma` and smooth, accessible anchor positioning.
   - Remove Gmail from this CTA; keep phone secondary and settings-driven.
   - Make registration heading, lead, closing title, closing text, and button label editable in admin.

2. **Contact trust fixes**
   - Add required privacy consent and accessible validation.
   - Replace the empty legacy email fallback with admin-managed settings.
   - Keep submitted data non-medical.

3. **Shared content and design cleanup**
   - Make footer facts and shared labels settings/content-driven.
   - Remove the hardcoded Facebook fallback.
   - Consolidate active layout/button/color tokens and remove unused duplicate presentation code.
   - Preserve the current visual character rather than redesigning the homepage.

4. **SEO and language cleanup**
   - Temporarily remove public English exposure and English alternates while retaining locale plumbing.
   - Generate a complete Lithuanian sitemap from published content.
   - Add verified dental-practice and breadcrumb schema.
   - Correct social-card types and images.
   - Keep `noindex` and the current robots block unchanged until launch.

5. **Legal and content integrity**
   - Connect stored legal content to the legal pages.
   - Replace unconfirmed factual code fallbacks with neutral output while preserving verified admin-entered values.

6. **Accessibility and performance pass**
   - Normalize focus, control semantics, labels, error associations, mobile navigation, and image loading/dimensions.
   - Keep reduced-motion support and the lazy-loaded map behavior, both of which already meet the standard well.

7. **Verification**
   - Test Home, Services list/detail, Prices, Registration including modal submission states, Articles list/detail, About, Contact/form/map, Privacy, Terms, maintenance mode, and 404/error states.
   - Verify at desktop, tablet, and mobile widths: shared gutters, no overflow, readable line lengths, keyboard operation, focus visibility, and screen-reader labels.
   - Confirm unique metadata, Lithuanian-only canonical output, sitemap entries, structured data, and that no search-indexing block is removed.

## What already meets the standard

- Public page data is generally server-rendered before delivery.
- Most route titles, descriptions, canonical links, and Open Graph text are unique and centralized.
- Public pages now share the homepage’s outer 1340px grid and responsive gutters.
- Long-form copy is left-aligned; no horizontal overflow was detected at 1280px or 390px.
- Contact-map code is loaded only near the viewport and reserves its height to avoid layout shift.
- Reduced-motion handling is already present.
- Appointment requests remain pending until personally confirmed.
- Maintenance mode remains intentionally closed by default, and site-wide indexing stays blocked until launch.

## Scope boundary

This pass improves the existing public website and its content controls. It does not change appointment availability rules, notification delivery, admin roles, database permissions, or launch status. The FAQ page remains a separately scoped future feature.
