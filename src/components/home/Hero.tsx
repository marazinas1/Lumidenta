import { useEffect, useRef } from "react";

import heroImageAsset from "@/assets/hero-telsiai-lake.jpg.asset.json";
import heroImageWebpAsset from "@/assets/hero-telsiai-lake.webp.asset.json";
import { Enso } from "@/components/site/Enso";
import { LocaleLink } from "@/components/site/LocaleLink";
import { useContent } from "@/content";
import { AVAILABILITY_SECTION_ID, scrollToId } from "@/lib/scroll-to";

export function Hero() {
  const { common, home } = useContent();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Cheap scroll-driven fade/lift: one CSS variable, rAF-throttled.
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.75));
      node.style.setProperty("--hero-progress", progress.toFixed(3));
      sectionRef.current?.style.setProperty("--hero-scroll", String(window.scrollY));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate min-h-[92vh] overflow-hidden"
    >
      <picture>
        <source srcSet={heroImageWebpAsset.url} type="image/webp" />
        <img
          src={heroImageAsset.url}
          alt={home.hero.imageAlt}
          width={2560}
          height={1440}
          fetchPriority="high"
          decoding="async"
          className="hero-parallax absolute inset-0 h-[118%] w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/25 to-ink/55" />

      <div
        ref={contentRef}
        className="hero-fade relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-6 pb-24 pt-40 lg:px-12 lg:pb-32"
      >
        <div className="max-w-2xl">
          <p className="label-caps text-warm-white/75">{home.hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,6.5vw,4.25rem)] leading-[1.08] font-medium text-warm-white">
            {home.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-warm-white/85 sm:text-lg">
            {home.hero.lead}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToId(AVAILABILITY_SECTION_ID)}
              className="rounded-full bg-sage px-7 py-3.5 text-sm font-medium text-warm-white transition-colors hover:bg-sage-deep"
            >
              {common.cta.checkDates}
            </button>
            <LocaleLink
              to="/apartamentai"
              className="rounded-full border border-warm-white/60 px-7 py-3.5 text-sm font-medium text-warm-white transition-colors hover:bg-warm-white hover:text-ink"
            >
              {home.hero.secondaryCta}
            </LocaleLink>
          </div>
        </div>

        <div className="mt-16 hidden justify-center lg:flex">
          <Enso className="h-10 w-10 animate-[spin_18s_linear_infinite] text-warm-white/45" />
        </div>
      </div>
    </section>
  );
}
