import { LocaleLink } from "@/components/site/LocaleLink";
import { useContent, useLocale } from "@/content";
export type LegalDocumentData = {
  name: string;
  html: string;
  updated_at?: string | null;
};

/** Renders a stored legal document (sanitized before it reaches the client). */
export function LegalDocumentPage({
  eyebrow,
  title,
  lead,
  doc,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  doc: LegalDocumentData | null;
}) {
  const { common, legal } = useContent();
  const locale = useLocale();
  const hasContent = Boolean(doc && doc.html.trim().length > 0);
  const updated = doc?.updated_at
    ? new Date(doc.updated_at).toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          <nav className="legal-breadcrumbs" aria-label={common.labels.breadcrumb}>
            <LocaleLink to="/">{common.nav.home}</LocaleLink>
            <span aria-hidden="true">·</span>
            <span>{title}</span>
          </nav>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <div className="legal-content">
          {hasContent ? (
            <>
              <div
                className="legal-prose"
                // Sanitized server-side in src/lib/sanitize-html.ts before it reaches the client.
                dangerouslySetInnerHTML={{ __html: doc?.html ?? "" }}
              />
              {updated ? (
                <p className="legal-updated">
                  {legal.updatedAt}: {updated}
                </p>
              ) : null}
            </>
          ) : (
            <div className="legal-unavailable">
              <h2>{legal.unavailableTitle}</h2>
              <p>{legal.unavailableText}</p>
            </div>
          )}
          </div>
        </div>
      </section>
    </>
  );
}