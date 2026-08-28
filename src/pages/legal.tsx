import { LegalDocumentPage, type LegalDocumentData } from "@/components/site/LegalDocument";
import { getContent, useContent } from "@/content";
import type { Locale } from "@/lib/locale";
import { useLooseLoaderData } from "@/lib/route-data";
import { pageHead } from "@/lib/seo";

type LegalLoaderData = { doc: LegalDocumentData | null };
type Kind = "rental" | "privacy";

/** Shared factory for the two legal documents. Real texts land in a later step. */
export function legalRoute(locale: Locale, kind: Kind) {
  const c = getContent(locale);
  const doc = c.legal[kind];
  return {
    loader: async (): Promise<LegalLoaderData> => ({ doc: null }),
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
