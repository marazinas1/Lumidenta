import { LocaleLink } from "@/components/site/LocaleLink";
import { Reveal, RevealItems } from "@/components/site/Reveal";
import { getContent } from "@/content";
import { ensureCatalog, useCatalog } from "@/lib/catalog";
import type { Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { pageHead } from "@/lib/seo";

const PAGE = "prices";

export function pricesRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/kainos",
        title: `Kainos — ${c.common.brand}`,
        description:
          "Odontologijos paslaugų kainos Vilniuje: plomba, burnos higiena, kanalų gydymas, protezavimas. Galutinė kaina patvirtinama po apžiūros.",
        locale,
      }),
    }),
    component: () => <PricesPage locale={locale} />,
  };
}

function PricesPage({ locale }: { locale: Locale }) {
  const { copy } = usePageContent(PAGE, locale);
  const { services } = useCatalog();
  const priced = services.filter((s) => s.priceText.trim());

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("hero_eyebrow", "Kainos")}</div>
          <h1>{copy("hero_heading", "Aiškios bazinės kainos.")}</h1>
          <p className="lead">
            {copy(
              "hero_lead",
              "Žemiau — dažniausių paslaugų bazinės kainos. Tikslų planą ir galutinę kainą aptariame vizito metu, prieš pradedant gydymą.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {priced.length > 0 ? (
            <RevealItems className="price-list">
              {priced.map((service) => (
                <LocaleLink
                  key={service.id}
                  to="/paslaugos/$slug"
                  params={{ slug: service.slug }}
                  className="price-row"
                >
                  <span className="price-name">
                    <strong>{service.title}</strong>
                    {service.excerpt ? <span>{service.excerpt}</span> : null}
                  </span>
                  <span className="price-value">
                    <strong>{service.priceText}</strong>
                    {service.priceNote ? <span>{service.priceNote}</span> : null}
                  </span>
                </LocaleLink>
              ))}
            </RevealItems>
          ) : (
            <p className="lead">Kainoraštis netrukus bus atnaujintas.</p>
          )}

          <Reveal className="price-note">
            <p>
              {copy(
                "footer_note",
                "Kainos yra orientacinės. Galutinė kaina priklauso nuo dantų būklės ir pasirinktų medžiagų — ji visada patvirtinama po apžiūros, prieš gydymą.",
              )}
            </p>
            <LocaleLink to="/kontaktai" className="btn">
              {copy("cta_button", "Susisiekti dėl vizito →")}
            </LocaleLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
