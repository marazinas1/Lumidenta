import { LocaleLink } from "@/components/site/LocaleLink";
import { getContent } from "@/content";
import { ensureCatalog, useCatalog } from "@/lib/catalog";
import type { Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { pageHead } from "@/lib/seo";

const PAGE = "home";

export function homeRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    // Fetched on the server before the HTML is sent, so the copy, services and
    // testimonials are in the markup the crawler parses rather than requested
    // after hydration.
    loader: async ({ context }: ContentLoaderArgs) => {
      await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/",
        title: c.home.seoTitle,
        description: c.home.seoDescription,
        locale,
      }),
    }),
    component: () => <Index locale={locale} />,
  };
}

function Index({ locale }: { locale: Locale }) {
  const { copy, image } = usePageContent(PAGE, locale);
  const { services, testimonials } = useCatalog();
  const heroPortrait = image("hero_portrait");
  const touchPhoto = image("touch_photo");
  const homeServices = services.filter((s) => s.showOnHome).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">
              {copy("hero_eyebrow", "Individuali odontologijos praktika Vilniuje")}
            </div>
            <h1>
              {copy("hero_heading", "Dantų priežiūra, paremta")}{" "}
              <span className="mark">{copy("hero_heading_mark", "kantrybe")}</span>.
            </h1>
            <p className="lead">
              {copy(
                "hero_lead",
                "Tausojantis gydymas, aiškiai paaiškintas planas ir sprendimai, parinkti pagal Jūsų situaciją — ne pagal šabloną.",
              )}
            </p>
            <div className="hero-actions">
              <LocaleLink to="/kontaktai" className="btn">
                {copy("hero_cta_primary", "Registruotis vizitui →")}
              </LocaleLink>
              <LocaleLink to="/apie" className="btn btn-ghost">
                {copy("hero_cta_secondary", "Apie mano praktiką")}
              </LocaleLink>
            </div>
            <div className="hero-note">
              {copy("hero_note", "Gyd. odontologė Erika · priimu Braškių g. 2B-1, Vilnius")}
            </div>
          </div>

          <div className="hero-photo">
            {heroPortrait ? (
              <img
                src={heroPortrait.url}
                alt={heroPortrait.alt || "Gyd. odontologė Erika"}
                loading="eager"
              />
            ) : (
              <div className="hero-photo-label">
                Erikos portretas kabinete
                <br />
                (vietos rezervuota)
              </div>
            )}
            <div className="float-card fc1">
              <div className="ic">📍</div>
              <div>
                <strong>{copy("hero_card1_title", "Priėmimo vieta")}</strong>
                <span>{copy("hero_card1_text", "Braškių g. 2B-1, Vilnius")}</span>
              </div>
            </div>
            <div className="float-card fc2">
              <div className="ic">✓</div>
              <div>
                <strong>{copy("hero_card2_title", "Individualus dėmesys")}</strong>
                <span>{copy("hero_card2_text", "kiekvienam vizitui")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="statbar">
          <div className="wrap">
            <div className="stat">
              <strong>{copy("stat1_value", "10+")}</strong>
              <span>{copy("stat1_label", "metų klinikinės patirties")}</span>
            </div>
            <div className="stat">
              <strong>{copy("stat2_value", "Optika")}</strong>
              <span>{copy("stat2_label", "naudojama kiekvienam vizitui")}</span>
            </div>
            <div className="stat">
              <strong>{copy("stat3_value", "Koferdamas")}</strong>
              <span>{copy("stat3_label", "gydymo ilgaamžiškumui")}</span>
            </div>
            <div className="stat-cta">
              <span>{copy("stat_cta_text", "Turite klausimą?")}</span>
              <LocaleLink to="/kontaktai" className="btn btn-line" style={{ padding: "8px 16px" }}>
                {copy("stat_cta_button", "Parašykite →")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="paslaugos">
        <div className="wrap">
          <div className="section-head">
            <h2>
              {copy("services_heading", "Viskas, ko reikia dantų sveikatai,")}{" "}
              <span className="soft">
                {copy("services_heading_soft", "vienoje ramioje vietoje.")}
              </span>
            </h2>
            <p>
              {copy(
                "services_lead",
                "Nuo kasdienės profilaktikos iki sudėtingesnio atstatymo — sprendimas visada aptariamas kartu.",
              )}
            </p>
          </div>
          <div className="svc-grid">
            {homeServices.map((service, index) => (
              <LocaleLink
                key={service.id}
                to="/paslaugos/$slug"
                params={{ slug: service.slug }}
                className={`svc-card ${service.tone}`}
              >
                <span className="num">{String(index + 1).padStart(2, "0")}</span>
                <div className="svc-ic">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.excerpt}</p>
                <span className="lm">Sužinoti daugiau →</span>
              </LocaleLink>
            ))}
          </div>
          <div className="svc-more">
            <LocaleLink to="/paslaugos" className="btn btn-line">
              {copy("services_all_button", "Visos paslaugos →")}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="touch" id="apie">
        <div className="wrap touch-grid">
          <div className="touch-photo">
            {touchPhoto ? (
              <img src={touchPhoto.url} alt={touchPhoto.alt || "Kabinetas"} loading="lazy" />
            ) : (
              <div className="touch-photo-label">
                Erikos nuotrauka kabinete
                <br />
                (vietos rezervuota)
              </div>
            )}
            <div className="quote-card">
              {copy("touch_quote", "„Gydymas turi būti aiškus, ramus ir niekada skubotas.“")}
            </div>
          </div>
          <div>
            <div className="eyebrow">{copy("touch_eyebrow", "Kitoks vizito jausmas")}</div>
            <h2>
              {copy("touch_heading", "Klinikinė kompetencija su")}{" "}
              <span className="mark">{copy("touch_heading_mark", "žmogišku")}</span>{" "}
              {copy("touch_heading_end", "požiūriu.")}
            </h2>
            <p className="lede">
              {copy(
                "touch_lede",
                "Prieš pradedant gydymą, aptariama, kas bus daroma ir kodėl. Sprendimai renkami taip, kad būtų išsaugota kuo daugiau savo danties audinių.",
              )}
            </p>
            <div className="checklist">
              <div className="check">
                <div className="dot">✓</div>
                {copy("touch_point1", "Aiškiai paaiškintas planas ir kaina")}
              </div>
              <div className="check">
                <div className="dot">✓</div>
                {copy("touch_point2", "Minimaliai invazyvūs sprendimai")}
              </div>
              <div className="check">
                <div className="dot">✓</div>
                {copy("touch_point3", "Rami aplinka nerimaujantiems pacientams")}
              </div>
            </div>
            <LocaleLink to="/apie" className="btn btn-line">
              {copy("touch_cta", "Apie mane →")}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="tstm" id="atsiliepimai">
        <div className="wrap">
          <div className="section-head">
            <h2>
              {copy("testimonials_heading", "Ką sako")}{" "}
              <span className="soft">{copy("testimonials_heading_soft", "pacientai.")}</span>
            </h2>
          </div>
          <div className="tstm-grid">
            {testimonials.map((t, index) => (
              <figure key={t.id} className={`tstm-card ${TONES[index % TONES.length]}`}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <strong>{t.authorName}</strong>
                  {t.authorDetail ? <span>{t.authorDetail}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="cta-panel">
          <div>
            <h2>{copy("cta_heading", "Sveikos šypsenos link — vienu vizitu.")}</h2>
            <p>
              {copy(
                "cta_text",
                "Vizito laiką suderinkite telefonu arba žinute. Priėmimas — Braškių g. 2B-1, Vilnius.",
              )}
            </p>
          </div>
          <LocaleLink to="/kontaktai" className="btn">
            {copy("cta_button", "Registruotis vizitui →")}
          </LocaleLink>
        </div>
      </div>
    </>
  );
}

const TONES = ["t1", "t2", "t3", "t4"] as const;
