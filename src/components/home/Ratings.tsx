import { EnsoFrame } from "@/components/site/Enso";
import { Reveal } from "@/components/site/Reveal";
import { useContent } from "@/content";

export function Ratings() {
  const { home } = useContent();
  const ratings = home.ratings.items;
  return (
    <section className="bg-warm-white px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="label-caps text-center text-stone">{home.ratings.eyebrow}</p>

        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          {ratings.map((rating, index) => (
            <Reveal key={rating.label} delay={index * 120}>
              <figure className="flex flex-col items-center text-center">
                <EnsoFrame className="h-20 w-20">
                  <span className="font-display text-xl text-ink">{rating.score}</span>
                </EnsoFrame>
                <figcaption className="mt-5 text-sm font-medium text-ink">{rating.label}</figcaption>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone">{rating.note}</p>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
