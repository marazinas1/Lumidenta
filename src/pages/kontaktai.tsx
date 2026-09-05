import { ContactForm } from "@/components/site/ContactForm";
import { ContactMapSection } from "@/components/site/ContactMapSection";
import { Reveal, RevealItems } from "@/components/site/Reveal";
import { getContent } from "@/content";
import { ensureCatalog, useCatalog } from "@/lib/catalog";
import type { Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { pageHead } from "@/lib/seo";

const PAGE = "contact";

export function contactsRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/kontaktai",
        title: c.kontaktai.seoTitle,
        description: c.kontaktai.seoDescription,
        locale,
      }),
    }),
    component: () => <ContactsPage locale={locale} />,
  };
}

function ContactsPage({ locale }: { locale: Locale }) {
  const c = getContent(locale);
  const { copy } = usePageContent(PAGE, locale);
  const { settings } = useCatalog();
  const address = [settings.addressLine, settings.district].filter(Boolean).join(", ");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("contact_eyebrow", c.kontaktai.eyebrow)}</div>
          <h1>{copy("contact_heading", "Susisiekime.")}</h1>
          <p className="lead">
            {copy(
              "contact_lead",
              "Parašykite arba paskambinkite — vizito laiką suderinsime Jums patogiu metu.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {settings.phone || settings.email ? (
            <RevealItems className="info-grid">
              {settings.phone ? (
                <div className="info-card">
                  <h2>{c.kontaktai.phonesLabel}</h2>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </div>
              ) : null}
              {settings.email ? (
                <div className="info-card">
                  <h2>{c.kontaktai.emailLabel}</h2>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </div>
              ) : null}
            </RevealItems>
          ) : null}

          <Reveal style={{ marginTop: "56px" }}>
            <ContactForm />
          </Reveal>

          <ContactMapSection address={address} />

          {address ? (
            <address className="contact-map-note">
              <span>{address}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
              >
                Atidaryti žemėlapyje →
              </a>
            </address>
          ) : null}



        </div>
      </section>
    </>
  );
}
