import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageTextField } from "@/components/admin/PageTextField";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { pageContentQuery } from "@/lib/page-content";
import { emptyPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/pages/contact")({
  component: ContactEditor,
});

const PAGE = "contact";

type Field = { slot: string; label: string; fallback: string; multiline?: boolean };

const FIELDS: Field[] = [
  { slot: "contact_eyebrow", label: "Viršutinė eilutė", fallback: "Kontaktai" },
  { slot: "contact_heading", label: "Antraštė", fallback: "Susisiekime." },
  {
    slot: "contact_lead",
    label: "Įžanga",
    fallback:
      "Parašykite arba paskambinkite — vizito laiką suderinsime Jums patogiu metu.",
    multiline: true,
  },
  { slot: "form_title", label: "Formos antraštė", fallback: "Parašykite man" },
  {
    slot: "form_lead",
    label: "Formos įžanga",
    fallback: "Užpildykite formą — atsakysiu el. paštu arba telefonu.",
    multiline: true,
  },
];

function ContactEditor() {
  const { canEdit } = useCanEdit();
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;
  const valueOf = (slot: string) => content.text[`${PAGE}:${slot}:lt`] ?? "";

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div>
        <h1 className="text-2xl font-semibold">Kontaktų puslapis</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Keiskite kontaktų puslapio tekstus. Telefonas, el. paštas ir adresas (jis rodomas ir
          žemėlapyje bei poraštėje) keičiami skyriuje{" "}
          <Link to="/admin/settings" className="underline underline-offset-2">
            Nustatymai
          </Link>
          .
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : (
        <section className="space-y-4 rounded-xl border border-border/70 p-5">
          <h2 className="text-lg font-medium">Puslapio tekstai</h2>
          <div className="grid gap-4">
            {FIELDS.map((field) => (
              <PageTextField
                key={field.slot}
                page={PAGE}
                slot={field.slot}
                label={field.label}
                fallback={field.fallback}
                value={valueOf(field.slot)}
                multiline={field.multiline ?? false}
              />
            ))}
          </div>
        </section>
      )}
    </fieldset>
  );
}
