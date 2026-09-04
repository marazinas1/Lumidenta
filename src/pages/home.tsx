import { LocaleLink } from "@/components/site/LocaleLink";
import { getContent } from "@/content";
import type { Locale } from "@/lib/locale";
import { pageHead } from "@/lib/seo";

export function homeRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    head: () => ({
      ...pageHead({
        path: "/",
        title: c.home.seoTitle,
        description: c.home.seoDescription,
        locale,
      }),
    }),
    component: Index,
  };
}

const services = [
  {
    tone: "t1",
    num: "01",
    icon: "🦷",
    title: "Profilaktika",
    text: "Reguliarūs patikrinimai ir ankstyva ėduonies diagnostika su odontologine optika.",
  },
  {
    tone: "t2",
    num: "02",
    icon: "✦",
    title: "Dantų plombavimas",
    text: "Estetiškos, atsparios medžiagos — rezultatas matomas jau pirmo vizito metu.",
  },
  {
    tone: "t3",
    num: "03",
    icon: "◈",
    title: "Protezavimas",
    text: "Užklotai ir vainikėliai stipriai pažeistiems dantims, kai plomba nebepakanka.",
  },
  {
    tone: "t4",
    num: "04",
    icon: "✧",
    title: "Dantų balinimas",
    text: "Kabinetinis balinimas ir tęstinis balinimas namuose individualiomis kapomis.",
  },
];

function Index() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">Individuali odontologijos praktika Vilniuje</div>
            <h1>
              Dantų priežiūra, paremta <span className="mark">kantrybe</span>.
            </h1>
            <p className="lead">
              Tausojantis gydymas, aiškiai paaiškintas planas ir sprendimai, parinkti pagal Jūsų
              situaciją — ne pagal šabloną.
            </p>
            <div className="hero-actions">
              <LocaleLink to="/kontaktai" className="btn">
                Registruotis vizitui →
              </LocaleLink>
              <LocaleLink to="/apie" className="btn btn-ghost">
                Apie mano praktiką
              </LocaleLink>
            </div>
            <div className="hero-note">
              Gyd. odontologė Erika · priimu Braškių g. 2B-1, Vilnius
            </div>
          </div>

          <div className="hero-photo">
            <div className="hero-photo-label">
              Erikos portretas kabinete
              <br />
              (vietos rezervuota)
            </div>
            <div className="float-card fc1">
              <div className="ic">📍</div>
              <div>
                <strong>Priėmimo vieta</strong>
                <span>Braškių g. 2B-1, Vilnius</span>
              </div>
            </div>
            <div className="float-card fc2">
              <div className="ic">✓</div>
              <div>
                <strong>Individualus dėmesys</strong>
                <span>kiekvienam vizitui</span>
              </div>
            </div>
          </div>
        </div>

        <div className="statbar">
          <div className="wrap">
            <div className="stat">
              <strong>10+</strong>
              <span>metų klinikinės patirties</span>
            </div>
            <div className="stat">
              <strong>Optika</strong>
              <span>naudojama kiekvienam vizitui</span>
            </div>
            <div className="stat">
              <strong>Koferdamas</strong>
              <span>gydymo ilgaamžiškumui</span>
            </div>
            <div className="stat-cta">
              <span>Turite klausimą?</span>
              <LocaleLink to="/kontaktai" className="btn btn-line" style={{ padding: "8px 16px" }}>
                Parašykite →
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="paslaugos">
        <div className="wrap">
          <div className="section-head">
            <h2>
              Viskas, ko reikia dantų sveikatai,{" "}
              <span className="soft">vienoje ramioje vietoje.</span>
            </h2>
            <p>
              Nuo kasdienės profilaktikos iki sudėtingesnio atstatymo — sprendimas visada aptariamas
              kartu.
            </p>
          </div>
          <div className="svc-grid">
            {services.map((service) => (
              <div key={service.num} className={`svc-card ${service.tone}`}>
                <span className="num">{service.num}</span>
                <div className="svc-ic">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <span className="lm">Sužinoti daugiau →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="touch" id="apie">
        <div className="wrap touch-grid">
          <div className="touch-photo">
            <div className="touch-photo-label">
              Erikos nuotrauka kabinete
              <br />
              (vietos rezervuota)
            </div>
            <div className="quote-card">
              „Gydymas turi būti aiškus, ramus ir niekada skubotas.“
            </div>
          </div>
          <div>
            <div className="eyebrow">Kitoks vizito jausmas</div>
            <h2>
              Klinikinė kompetencija su <span className="mark">žmogišku</span> požiūriu.
            </h2>
            <p className="lede">
              Prieš pradedant gydymą, aptariama, kas bus daroma ir kodėl. Sprendimai renkami taip,
              kad būtų išsaugota kuo daugiau savo danties audinių.
            </p>
            <div className="checklist">
              <div className="check">
                <div className="dot">✓</div>Aiškiai paaiškintas planas ir kaina
              </div>
              <div className="check">
                <div className="dot">✓</div>Minimaliai invazyvūs sprendimai
              </div>
              <div className="check">
                <div className="dot">✓</div>Rami aplinka nerimaujantiems pacientams
              </div>
            </div>
            <LocaleLink to="/apie" className="btn btn-line">
              Apie mane →
            </LocaleLink>
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="cta-panel">
          <div>
            <h2>Sveikos šypsenos link — vienu vizitu.</h2>
            <p>
              Vizito laiką suderinkite telefonu arba žinute. Priėmimas — Braškių g. 2B-1, Vilnius.
            </p>
          </div>
          <LocaleLink to="/kontaktai" className="btn">
            Registruotis vizitui →
          </LocaleLink>
        </div>
      </div>
    </>
  );
}
