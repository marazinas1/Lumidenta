import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PageImageSlot } from "@/components/admin/PageImageSlot";
import { PageTextField } from "@/components/admin/PageTextField";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { getMyRole } from "@/lib/roles.functions";
import { pageContentQuery } from "@/lib/page-content";
import { emptyPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/pages/about")({
  component: AboutEditor,
});

const PAGE = "about";

type Field = { slot: string; label: string; fallback: string; multiline?: boolean };

const SECTIONS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "Pirmasis ekranas",
    fields: [
      { slot: "about_eyebrow", label: "Viršutinė eilutė", fallback: "Apie" },
      { slot: "about_heading", label: "Antraštė", fallback: "Rami praktika, kruopštus darbas." },
      {
        slot: "about_lead",
        label: "Įžanga",
        fallback:
          "Gydytoja odontologė, dirbanti individualiai — vienas pacientas, visas dėmesys.",
        multiline: true,
      },
    ],
  },
  {
    title: "Pasakojimas",
    note: "Trys pastraipos. Palikus lauką tuščią, rodomas numatytasis tekstas.",
    fields: [
      {
        slot: "about_body1",
        label: "1 pastraipa",
        fallback:
          "Esu gydytoja odontologė. Dirbu individualioje praktikoje Vilniuje ir kiekvienam pacientui skiriu tiek laiko, kiek reikia — be skubos ir be konvejerio.",
        multiline: true,
      },
      {
        slot: "about_body2",
        label: "2 pastraipa",
        fallback:
          "Gydymui naudoju didinamąją optiką: ji leidžia dirbti tiksliau ir išsaugoti kuo daugiau savo danties audinių. Renkuosi minimaliai invazyvų kelią — kur įmanoma, dantį atkuriu, o ne šalinu.",
        multiline: true,
      },
      {
        slot: "about_body3",
        label: "3 pastraipa",
        fallback:
          "Prieš pradedant gydymą visada aptariame planą, eigą ir kainą, kad žinotumėte, kas Jūsų laukia.",
        multiline: true,
      },
      {
        slot: "about_portrait_label",
        label: "Užrašas, kol nėra nuotraukos",
        fallback: "Nuotrauka bus netrukus",
      },
    ],
  },
  {
    title: "Kvalifikacija",
    fields: [
      { slot: "about_credentials_heading", label: "Antraštė", fallback: "Kvalifikacija" },
      {
        slot: "about_credentials",
        label: "Tekstas",
        fallback:
          "Informacija apie kvalifikaciją bus paskelbta ją patvirtinus.",
        multiline: true,
      },
    ],
  },
];

function AboutEditor() {
  const { canEdit } = useCanEdit();
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;

  const fetchRole = useServerFn(getMyRole);
  const { data: me } = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}) });
  const isDeveloper = me?.role === "developer";

  const valueOf = (slot: string) => content.text[`${PAGE}:${slot}:lt`] ?? "";

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div>
        <h1 className="text-2xl font-semibold">Apie puslapis</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Keiskite „Apie“ puslapio tekstus ir nuotrauką. Palikus lauką tuščią, rodomas numatytasis
          tekstas.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : (
        <>
          <section className="space-y-4 rounded-xl border border-border/70 p-5">
            <h2 className="text-lg font-medium">Nuotrauka</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <PageImageSlot
                page={PAGE}
                slot="about_portrait"
                label="Portretas"
                hint="Vertikali nuotrauka, geriausiai 900×1100 px."
                ratio="3 / 3.7"
                chosen={content.media[`${PAGE}:about_portrait`] ?? null}
                fallback={content.defaults[`${PAGE}:about_portrait`] ?? null}
                isDeveloper={isDeveloper}
              />
            </div>
          </section>

          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-4 rounded-xl border border-border/70 p-5">
              <div>
                <h2 className="text-lg font-medium">{section.title}</h2>
                {section.note ? (
                  <p className="mt-1 text-sm text-muted-foreground">{section.note}</p>
                ) : null}
              </div>
              <div className="grid gap-4">
                {section.fields.map((field) => (
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
          ))}
        </>
      )}
    </fieldset>
  );
}
