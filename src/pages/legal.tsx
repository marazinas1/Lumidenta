import { LegalDocumentPage, type LegalDocumentData } from "@/components/site/LegalDocument";
import { getContent, useContent } from "@/content";
import type { Locale } from "@/lib/locale";
import { useLooseLoaderData } from "@/lib/route-data";
import { ensurePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { resolveCopy } from "@/lib/page-content";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { pageHead } from "@/lib/seo";

type LegalLoaderData = { doc: LegalDocumentData | null };
type Kind = "rental" | "privacy";

/** Shared factory for the two legal documents stored through the page editor. */
export function legalRoute(locale: Locale, kind: Kind) {
  const c = getContent(locale);
  const doc = c.legal[kind];
  return {
    loader: async ({ context }: ContentLoaderArgs): Promise<LegalLoaderData> => {
      const content = await ensurePageContent(context);
      const page = kind === "privacy" ? "privacy" : "terms";
      const raw = resolveCopy(content, page, "body", locale, "").trim();
      if (!raw) return { doc: null };
      const html = sanitizeHtml(raw.includes("<") ? raw : raw.split(/\n{2,}/).map((paragraph) => `<p>${paragraph}</p>`).join(""));
      return { doc: { name: doc.title, html } };
    },
    head: () => ({
      ...pageHead({
        path: doc.path,
        title: doc.seoTitle,
        description: doc.seoDescription,
        type: "article",
        locale,
      }),
    }),
    component: () => <LegalPage kind={kind} />,
  };
}

function LegalPage({ kind }: { kind: Kind }) {
  const c = useContent();
  const meta = c.legal[kind];
  const { doc } = useLooseLoaderData<LegalLoaderData>();
  return (
    <LegalDocumentPage
      eyebrow={meta.eyebrow}
      title={doc?.html.trim() && doc.name.trim() ? doc.name : meta.title}
      lead={meta.lead}
      doc={doc ?? null}
    />
  );
}
