import { notFound, useParams } from "@tanstack/react-router";

import { LocaleLink } from "@/components/site/LocaleLink";
import { getContent } from "@/content";
import { ensureCatalog, useCatalog } from "@/lib/catalog";
import type { ServiceRow } from "@/lib/catalog.functions";
import type { Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { pageHead } from "@/lib/seo";

const PAGE = "services";
const TONES = ["t1", "t2", "t3", "t4"] as const;

/* ------------------------------------------------------------------ /paslaugos */

export function servicesRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/paslaugos",
        title: `Paslaugos — ${c.common.brand}`,
        description:
          "Odontologijos paslaugos Vilniuje: gydymas, burnos higiena, endodontija, protezavimas, vaikų dantų priežiūra.",
        locale,
      }),
    }),
    component: () => <ServicesPage locale={locale} />,
  };
}

function ServicesPage({ locale }: { locale: Locale }) {
  const { copy } = usePageContent(PAGE, locale);
  const { services } = useCatalog();

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("hero_eyebrow", "Paslaugos")}</div>
          <h1>{copy("hero_heading", "Ką galiu Jums padėti išspręsti.")}</h1>
          <p className="lead">
            {copy(
              "hero_lead",
              "Nuo profilaktikos iki atstatomojo gydymo — kiekvienas planas aptariamas prieš pradedant.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          <div className="svc-grid">
            {services.map((service, index) => (
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
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ /paslaugos/$slug */

type SlugLoaderArgs = ContentLoaderArgs & { params: { slug: string } };

export function serviceDetailRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context, params }: SlugLoaderArgs) => {
      const [, catalog] = await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      const service = catalog.services.find((s) => s.slug === params.slug);
      if (!service) throw notFound();
      return { service };
    },
    head: ({ loaderData }: { loaderData?: { service: ServiceRow } }) => {
      const service = loaderData?.service;
      if (!service) return {};
      return pageHead({
        path: `/paslaugos/${service.slug}`,
        title: `${service.title} — ${c.common.brand}`,
        description: service.excerpt.slice(0, 155),
        locale,
      });
    },
    errorComponent: ({ error }: { error: Error }) => (
      <section className="page-body">
        <div className="wrap" role="alert">
          {error.message}
        </div>
      </section>
    ),
    notFoundComponent: () => (
      <section className="page-body">
        <div className="wrap">
          <p>Tokios paslaugos nėra.</p>
          <LocaleLink to="/paslaugos" className="btn btn-line">
            Visos paslaugos →
          </LocaleLink>
        </div>
      </section>
    ),
    component: ServiceDetailPage,
  };
}

function ServiceDetailPage() {
  const { services } = useCatalog();
  const params = useParams({ strict: false }) as { slug?: string };
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return null;
  const index = services.indexOf(service);

  return <ServiceDetailView service={service} tone={TONES[index % TONES.length] ?? "t1"} />;
}

function ServiceDetailView({ service, tone }: { service: ServiceRow; tone: string }) {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <LocaleLink to="/paslaugos" className="back-link">
            ← Visos paslaugos
          </LocaleLink>
          <div className={`svc-ic ${tone}`} aria-hidden="true">
            {service.icon}
          </div>
          <h1>{service.title}</h1>
          <p className="lead">{service.excerpt}</p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          <div className="prose">
            {service.body
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>

          {service.includes.length > 0 ? (
            <div className="checklist" style={{ marginTop: "32px" }}>
              {service.includes.map((item) => (
                <div className="check" key={item}>
                  <div className="dot">✓</div>
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: "40px" }}>
            <LocaleLink to="/kontaktai" className="btn">
              Registruotis vizitui →
            </LocaleLink>
          </div>
        </div>
      </section>
    </>
  );
}
