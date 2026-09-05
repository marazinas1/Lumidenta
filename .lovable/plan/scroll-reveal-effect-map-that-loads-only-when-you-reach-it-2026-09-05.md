# Scroll reveal effect + map that loads only when you reach it

## What you'll see

Text blocks and cards across the site gently fade in and slide up as you scroll to them — the same calm, modern motion as the StageHomy site. Nothing moves on its own after it appears, and the effect respects the "reduce motion" setting on phones and computers.

On the contact page, the map only starts loading when you scroll near it, so the page opens faster.

## Map loading

The contact map already waits for you to scroll before it loads, but it starts quite early and it looks up the address position immediately on page open. Changes:

- Start loading the map only when its area is close to the screen (small pre-load margin), matching the Halliday behaviour.
- Move the address lookup so it also runs only at that moment, not on page load.
- Keep a soft placeholder block in place so the layout does not jump.

## Reveal effect

- A small shared reveal helper (`useReveal` hook + `Reveal` wrapper component) that watches an element and adds a `is-visible` class the first time it enters the screen.
- CSS in `src/styles.css`: elements start slightly lower and transparent, then ease into place over ~0.7s; optional small stagger delay for grids of cards; disabled under `prefers-reduced-motion`.
- Applied to: home page sections (hero text, stats, services grid, testimonials, human-touch, CTA), services list and service detail, about, contact, articles list and article page. The header, footer and admin panel are left untouched.
- First screen content (hero) reveals immediately on load rather than waiting for a scroll.

## Technical notes

- `src/hooks/use-reveal.ts`: IntersectionObserver with `threshold: 0.15`, `rootMargin: "0px 0px -10% 0px"`, unobserves after first trigger; returns `{ ref, revealed }`. SSR-safe (starts visible if no IntersectionObserver).
- `src/components/site/Reveal.tsx`: thin wrapper taking `as`, `delay`, `className`.
- CSS classes `.luma .reveal` / `.reveal.is-visible`, with `--reveal-delay` custom property for staggering.
- `ContactMapSection.tsx`: reduce `rootMargin` to ~200px and pass the "visible" flag down so geocoding starts with the map, not before.

## Check before done

- Typecheck passes; `/`, `/paslaugos`, `/apie`, `/kontaktai`, `/straipsniai` return 200.
- Scroll check in a browser: sections animate once, map network requests only fire after scrolling down the contact page.
