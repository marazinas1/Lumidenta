import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageTextField } from "@/components/admin/PageTextField";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { emptyPageContent } from "@/lib/page-content.functions";
import { pageContentQuery } from "@/lib/page-content";

export const Route = createFileRoute("/_authenticated/admin/settings/pages/registration")({
  component: RegistrationEditor,
});

const FIELDS = [
  ["hero_eyebrow", "Viršutinė eilutė", "Registracija", false],
  ["hero_heading", "Antraštė", "Laisvi vizito laikai.", false],
  ["hero_lead", "Įžanga", "Pasirinkite paslaugą ir Jums tinkantį laiką — užklausa atkeliaus pas mane, o vizitą patvirtinsiu asmeniškai telefonu arba el. paštu.", true],
  ["cta_heading", "Kvietimo antraštė", "Norite pasitarti pirma?", false],
  ["cta_text", "Kvietimo tekstas", "Jei nesate tikri, kurios paslaugos ar kiek laiko reikia, parašykite arba paskambinkite — vizitą suderinsime kartu.", true],
  ["cta_button", "Mygtukas", "Parašyti žinutę →", false],
] as const;

function RegistrationEditor() {
  const { canEdit } = useCanEdit();
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;
  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div><h1 className="text-2xl font-semibold">Registracijos puslapis</h1><p className="mt-2 max-w-prose text-sm text-muted-foreground">Keiskite registracijos puslapio antraštę ir apatinį kvietimą susisiekti.</p></div>
      {isLoading ? <p className="text-sm text-muted-foreground">Kraunama…</p> : (
        <section className="space-y-5 rounded-xl border border-border/70 p-5">
          {FIELDS.map(([slot, label, fallback, multiline]) => <PageTextField key={slot} page="registration" slot={slot} label={label} fallback={fallback} multiline={multiline} value={content.text[`registration:${slot}:lt`] ?? ""} />)}
        </section>
      )}
    </fieldset>
  );
}