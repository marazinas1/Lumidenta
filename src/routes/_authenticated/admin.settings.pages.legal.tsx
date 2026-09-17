import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageTextField } from "@/components/admin/PageTextField";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { emptyPageContent } from "@/lib/page-content.functions";
import { pageContentQuery } from "@/lib/page-content";

export const Route = createFileRoute("/_authenticated/admin/settings/pages/legal")({ component: LegalEditor });

const DOCUMENTS = [
  { page: "privacy", title: "Privatumo politika", slot: "body", label: "Dokumento tekstas" },
  { page: "terms", title: "Paslaugų teikimo taisyklės", slot: "body", label: "Dokumento tekstas" },
] as const;

function LegalEditor() {
  const { canEdit } = useCanEdit();
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;
  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div><h1 className="text-2xl font-semibold">Teisiniai puslapiai</h1><p className="mt-2 max-w-prose text-sm text-muted-foreground">Įrašykite patvirtintus dokumentų tekstus. Tuščias dokumentas viešai rodomas kaip ruošiamas.</p></div>
      {isLoading ? <p className="text-sm text-muted-foreground">Kraunama…</p> : DOCUMENTS.map((document) => (
        <section key={document.page} className="space-y-5 rounded-xl border border-border/70 p-5">
          <h2 className="text-lg font-medium">{document.title}</h2>
          <PageTextField page={document.page} slot={document.slot} label={document.label} fallback="Įklijuokite patvirtintą dokumento tekstą." multiline value={content.text[`${document.page}:${document.slot}:lt`] ?? ""} />
        </section>
      ))}
    </fieldset>
  );
}