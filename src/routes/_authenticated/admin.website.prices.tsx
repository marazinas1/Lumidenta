import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { PageTextField } from "@/components/admin/PageTextField";
import { pageContentQuery } from "@/lib/page-content";
import { emptyPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/_authenticated/admin/website/prices")({
  component: PricesEditor,
});

const PAGE = "prices";

type Field = { slot: string; label: string; fallback: string; multiline?: boolean };

const FIELDS: Field[] = [
  { slot: "hero_eyebrow", label: "Viršutinė eilutė", fallback: "Kainos" },
  { slot: "hero_heading", label: "Antraštė", fallback: "Aiškios bazinės kainos." },
  {
    slot: "hero_lead",
    label: "Įžanga",
    fallback:
      "Žemiau — dažniausių paslaugų bazinės kainos. Tikslų planą ir galutinę kainą aptariame vizito metu, prieš pradedant gydymą.",
    multiline: true,
  },
  {
    slot: "footer_note",
    label: "Pastaba po kainoraščiu",
    fallback:
      "Kainos yra orientacinės. Galutinė kaina priklauso nuo dantų būklės ir pasirinktų medžiagų — ji visada patvirtinama po apžiūros, prieš gydymą.",
    multiline: true,
  },
  { slot: "cta_button", label: "Mygtukas", fallback: "Susisiekti dėl vizito →" },
];

function PricesEditor() {
  const { canEdit } = useCanEdit();
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;
  const valueOf = (slot: string) => content.text[`${PAGE}:${slot}:lt`] ?? "";

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div>
        <h1 className="text-2xl font-semibold">Kainos</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Čia keičiami kainų puslapio tekstai. Pačios kainos įrašomos prie kiekvienos paslaugos
          skyriuje „Paslaugos“ — laukai „Kaina“ ir „Kainos pastaba“.
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
