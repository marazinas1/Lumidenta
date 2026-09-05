import { PageHero } from "@/components/site/PageHero";
import { PageSection, Prose } from "@/components/site/Prose";
import { Reveal } from "@/components/site/Reveal";
import { getContent, useContent } from "@/content";
import { localizePath, type Locale } from "@/lib/locale";
import { ensurePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { breadcrumbLd, pageHead } from "@/lib/seo";

export function aboutRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await ensurePageContent(context);
      return null;
    },
    head: () => ({
      ...pageHead({ path: "/apie", title: c.apie.seoTitle, description: c.apie.seoDescription, locale }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbLd([
              { name: c.common.nav.home, path: localizePath("/", locale) },
              { name: c.apie.title, path: localizePath("/apie", locale) },
            ]),
          ),
        },
      ],
    }),
    component: AboutPage,
  };
}

function AboutPage() {
  const c = useContent();
  return (
    <>
      <PageHero eyebrow={c.apie.eyebrow} title={c.apie.title} lead={c.apie.lead} />

      <PageSection>
        <div className="mx-auto max-w-3xl space-y-14 text-center">
          {c.apie.sections.map((section, index) => (
            <Reveal key={section.title} delay={index * 80}>
              <h2 className="font-display text-[clamp(1.6rem,3.2vw,2rem)] font-medium text-ink">
                {section.title}
              </h2>
              <Prose className="mt-5">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Prose>
            </Reveal>
          ))}
        </div>
      </PageSection>
    </>
  );
}
