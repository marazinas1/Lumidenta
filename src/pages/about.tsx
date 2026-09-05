import { getContent } from "@/content";
import { localizePath, type Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { breadcrumbLd, pageHead } from "@/lib/seo";

const PAGE = "about";

export function aboutRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await ensurePageContent(context);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/apie",
        title: c.apie.seoTitle,
        description: c.apie.seoDescription,
        locale,
      }),
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
    component: () => <AboutPage locale={locale} />,
  };
}

function AboutPage({ locale }: { locale: Locale }) {
  const { copy, image } = usePageContent(PAGE, locale);
  const portrait = image("about_portrait");

  const paragraphs = [
    copy(
      "about_body1",
      "Esu gydytoja odontologė. Dirbu individualioje praktikoje Vilniuje ir kiekvienam pacientui skiriu tiek laiko, kiek reikia — be skubos ir be konvejerio.",
    ),
    copy(
      "about_body2",
      "Gydymui naudoju didinamąją optiką: ji leidžia dirbti tiksliau ir išsaugoti kuo daugiau savo danties audinių. Renkuosi minimaliai invazyvų kelią — kur įmanoma, dantį atkuriu, o ne šalinu.",
    ),
    copy(
      "about_body3",
      "Prieš pradedant gydymą visada aptariame planą, eigą ir kainą, kad žinotumėte, kas Jūsų laukia.",
    ),
  ];

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("about_eyebrow", "Apie")}</div>
          <h1>{copy("about_heading", "Rami praktika, kruopštus darbas.")}</h1>
          <p className="lead">
            {copy(
              "about_lead",
              "Gydytoja odontologė, dirbanti individualiai — vienas pacientas, visas dėmesys.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {portrait ? (
            <img
              src={portrait.url}
              alt={portrait.alt || "Gydytoja odontologė"}
              loading="lazy"
              style={{
                width: "100%",
                maxHeight: "460px",
                objectFit: "cover",
                borderRadius: "var(--lradius)",
                marginBottom: "40px",
              }}
            />
          ) : null}

          <div className="prose">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2>{copy("about_credentials_heading", "Kvalifikacija")}</h2>
          <div className="prose">
            <p>
              {copy(
                "about_credentials",
                "LSMU Odontologijos fakultetas, 2014 m. Daugiau nei 10 metų klinikinės praktikos.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
