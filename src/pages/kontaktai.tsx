import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { PageSection } from "@/components/site/Prose";
import { Reveal } from "@/components/site/Reveal";
import { getContent, useContent } from "@/content";
import { contact } from "@/data/contact";
import type { Locale } from "@/lib/locale";
import { pageHead } from "@/lib/seo";

export function contactsRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    head: () => ({
      ...pageHead({
        path: "/kontaktai",
        title: c.kontaktai.seoTitle,
        description: c.kontaktai.seoDescription,
        locale,
      }),
    }),
    component: ContactsPage,
  };
}

function ContactsPage() {
  const c = useContent();
  const kontaktai = c.kontaktai;
  return (
    <>
      <PageHero
        eyebrow={kontaktai.eyebrow}
        title={kontaktai.title}
        lead={kontaktai.lead}
        crumbs={[{ label: c.common.nav.home, to: "/" }, { label: kontaktai.eyebrow }]}
      />

      <PageSection>
        {contact.address || contact.phones.length > 0 || contact.email ? (
          <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-3">
            {contact.address ? (
              <Reveal>
                <h2 className="label-caps text-stone/80">{kontaktai.addressLabel}</h2>
                <address className="mt-3 text-base not-italic leading-relaxed text-ink">
                  {contact.address}
                </address>
              </Reveal>
            ) : null}

            {contact.phones.length > 0 ? (
              <Reveal delay={80}>
                <h2 className="label-caps text-stone/80">{kontaktai.phonesLabel}</h2>
                <div className="mt-3 space-y-2 text-base text-ink">
                  {contact.phones.map((phone) => (
                    <p key={phone}>
                      <a className="hover:text-sage" href={`tel:${phone.replace(/\s/g, "")}`}>
                        {phone}
                      </a>
                    </p>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {contact.email ? (
              <Reveal delay={160}>
                <h2 className="label-caps text-stone/80">{kontaktai.emailLabel}</h2>
                <p className="mt-3 text-base text-ink">
                  <a className="hover:text-sage" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </p>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        <Reveal delay={80} className="mt-16">
          <div className="mx-auto max-w-7xl">
            <ContactForm />
          </div>
        </Reveal>
      </PageSection>
    </>
  );
}
