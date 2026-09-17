# Unify every public page with the homepage layout

## Goal
Make the homepage the visual standard for the entire public website: the same outer width, side gutters, alignment axes, vertical rhythm, and responsive behavior everywhere.

## Confirmed audit findings
- At a 1280px viewport, the homepage content uses the full shared container with **48px side gutters**.
- Inner-page headers are currently restricted to 900px, while article and service text is restricted again to about 760px. These stacked limits create the oversized empty margins visible in the supplied captures.
- The service checklist and article image use a different 1100px axis, so headings, body text, images, cards, and calls to action do not line up.
- The “Kvalifikacija” block adds centered text on top of the narrow text width, making a long factual section difficult to read.
- Prices, contacts, registration, service pages, articles, and the about page reuse `.wrap`, but page-specific maximum widths override it inconsistently.

## Changes
1. **Create one public-page container standard**
   - Keep the homepage’s existing 1340px outer container.
   - Use the same responsive side gutters everywhere: 48px desktop, 32px tablet, 20px mobile.
   - Remove the inner-page rule that shrinks the entire header container to 900px.
   - Establish shared layout classes for page introductions, normal content, wide media/feature blocks, and readable long-form text.

2. **Standardize alignment and spacing**
   - Keep page titles and short introductions visually balanced within the shared outer grid.
   - Make body copy, section headings, lists, and qualification content left-aligned.
   - Reserve centered alignment only for deliberate short calls to action or homepage-style section introductions.
   - Apply one consistent sequence for space between page heading, main content, sections, and footer.

3. **Fix every public content type**
   - **About:** retain the balanced text/photo composition; rebuild “Kvalifikacija” as a broad, left-aligned content section instead of a narrow centered paragraph.
   - **Service detail:** align description, checklist, note, and booking action to one coherent editorial grid; remove the narrow text island.
   - **Article detail:** align title, cover image, article body, author, and booking action; widen the reading area without creating overly long lines.
   - **Service and article listings:** use the same outer edges and card grid rhythm as the homepage.
   - **Prices, contacts, and registration:** align cards, form, map, calendar, and notices to the homepage container and shared section spacing.
   - **Legal pages:** use the same outer gutters and page-heading system while retaining a readable legal-text measure.
   - Review footer and shared call-to-action sections so their edges match the same grid.

4. **Remove conflicting styling**
   - Consolidate duplicate `.prose`, `.page-head`, `.page-body`, article, service, contact, and about width/alignment rules.
   - Remove page-specific centering and maximum widths that fight the shared system.
   - Keep the current Lumidenta colors, typography, content, images, and functionality unchanged.

5. **Verify the full website**
   - Check the homepage, About, Services list and detail, Prices, Registration, Articles list and detail, Contacts, Privacy, and Terms pages.
   - Compare desktop rendering directly against the homepage’s 48px edge alignment.
   - Test tablet and mobile gutters, wrapping, reading widths, and horizontal overflow.
   - Confirm navigation, forms, map, booking controls, and maintenance mode remain visually and functionally intact.

## Technical note
The outer container will be universal; narrower reading widths will be used only inside that container where long-form readability requires them. Those inner widths will follow a small documented scale rather than arbitrary page-specific values, and normal prose will remain left-aligned.
