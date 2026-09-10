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
          "Odontologijos paslaugų kainoraštis Vilniuje: konsultacija, burnos higiena, plombavimas, kanalų gydymas, protezavimas. Galutinė kaina patvirtinama po apžiūros.",
        locale,
      }),
    }),
    component: () => <PricesPage locale={locale} />,
  };
}

function PricesPage({ locale }: { locale: Locale }) {
  const { copy } = usePageContent(PAGE, locale);
  const { priceGroups } = useCatalog();
  const groups = priceGroups.filter((group) => group.items.length > 0);

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("hero_eyebrow", "Kainoraštis")}</div>
          <h1>{copy("hero_heading", "Aiškios kainos, be netikėtumų.")}</h1>
          <p className="lead">
            {copy(
              "hero_lead",
              "Žemiau — dažniausių procedūrų kainos. Tikslų planą ir galutinę kainą aptariame vizito metu, prieš pradedant gydymą.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {groups.length > 0 ? (
            <RevealItems className="price-groups">
              {groups.map((group) => (
                <div className="price-group" key={group.id}>
                  <div className="price-group-head">
                    <h2>{group.title}</h2>
                    {group.note ? <p>{group.note}</p> : null}
                  </div>
                  <ul className="price-lines">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <span className="price-name">
                          <strong>{item.title}</strong>
                          {item.note ? <span>{item.note}</span> : null}
                        </span>
                        <span className="price-value">{item.priceText || "pagal konsultaciją"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </RevealItems>
          ) : (
            <p className="lead">Kainoraštis netrukus bus paskelbtas.</p>
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
