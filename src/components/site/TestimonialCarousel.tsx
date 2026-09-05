import { useState } from "react";

import type { TestimonialRow } from "@/lib/catalog.functions";

const TONES = ["t1", "t2", "t3", "t4"] as const;
const PER_VIEW = 3;

/**
 * Shows three testimonials at a time and wraps around in both directions,
 * so the arrows never dead-end. Rendered from the SSR-primed list, so the
 * first page is in the HTML the crawler reads.
 */
export function TestimonialCarousel({ items }: { items: TestimonialRow[] }) {
  const [start, setStart] = useState(0);

  if (items.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(items.length / PER_VIEW));
  const visible =
    items.length <= PER_VIEW
      ? items
      : Array.from({ length: PER_VIEW }, (_, i) => items[(start + i) % items.length]!);

  const step = (dir: number) => setStart((s) => (s + dir * PER_VIEW + items.length) % items.length);

  return (
    <div className="tstm-carousel">
      <div className="tstm-grid">
        {visible.map((t, index) => (
          <figure key={`${t.id}-${index}`} className={`tstm-card ${TONES[index % TONES.length]}`}>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <strong>{t.authorName}</strong>
              {t.authorDetail ? <span>{t.authorDetail}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {items.length > PER_VIEW ? (
        <div className="tstm-nav">
          <button
            type="button"
            className="tstm-arrow"
            aria-label="Ankstesni atsiliepimai"
            onClick={() => step(-1)}
          >
            ←
          </button>
          <div className="tstm-dots">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`tstm-dot${Math.floor(start / PER_VIEW) % pageCount === i ? " is-active" : ""}`}
                aria-label={`Rodyti ${i + 1} atsiliepimų grupę`}
                onClick={() => setStart((i * PER_VIEW) % items.length)}
              />
            ))}
          </div>
          <button
            type="button"
            className="tstm-arrow"
            aria-label="Kiti atsiliepimai"
            onClick={() => step(1)}
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
