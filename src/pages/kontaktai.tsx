import { ContactForm } from "@/components/site/ContactForm";
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
          {address || settings.phone || settings.email ? (
            <div className="info-grid">
              {address ? (
                <div className="info-card">
                  <h2>{c.kontaktai.addressLabel}</h2>
                  <address>{address}</address>
                </div>
              ) : null}
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
            </div>
          ) : null}

          <div style={{ marginTop: "56px" }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
