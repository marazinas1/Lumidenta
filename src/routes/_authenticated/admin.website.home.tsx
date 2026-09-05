import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PageImageSlot } from "@/components/admin/PageImageSlot";
import { PageTextField } from "@/components/admin/PageTextField";
import { getMyRole } from "@/lib/roles.functions";
import { pageContentQuery } from "@/lib/page-content";
import { emptyPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/_authenticated/admin/website/home")({
  component: HomeEditor,
});

const PAGE = "home";

type Field = { slot: string; label: string; fallback: string; multiline?: boolean };

const SECTIONS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "Pirmasis ekranas",
    fields: [
      {
        slot: "hero_eyebrow",
        label: "Viršutinė eilutė",
        fallback: "Individuali odontologijos praktika Vilniuje",
      },
      { slot: "hero_heading", label: "Antraštė", fallback: "Dantų priežiūra, paremta" },
      { slot: "hero_heading_mark", label: "Paryškintas žodis", fallback: "kantrybe" },
      {
        slot: "hero_lead",
        label: "Įžanga",
        fallback:
          "Tausojantis gydymas, aiškiai paaiškintas planas ir sprendimai, parinkti pagal Jūsų situaciją — ne pagal šabloną.",
        multiline: true,
      },
      { slot: "hero_cta_primary", label: "Pagrindinis mygtukas", fallback: "Registruotis vizitui →" },
      { slot: "hero_cta_secondary", label: "Antrasis mygtukas", fallback: "Apie mano praktiką" },
      {
        slot: "hero_note",
        label: "Pastaba po mygtukais",
        fallback: "Gyd. odontologė Erika · priimu Braškių g. 2B-1, Vilnius",
      },
    ],
  },
  {
    title: "Kortelės ant nuotraukos",
    fields: [
      { slot: "hero_card1_title", label: "1 kortelės antraštė", fallback: "Priėmimo vieta" },
      { slot: "hero_card1_text", label: "1 kortelės tekstas", fallback: "Braškių g. 2B-1, Vilnius" },
      { slot: "hero_card2_title", label: "2 kortelės antraštė", fallback: "Individualus dėmesys" },
      { slot: "hero_card2_text", label: "2 kortelės tekstas", fallback: "kiekvienam vizitui" },
    ],
  },
  {
    title: "Skaičių juosta",
    fields: [
      { slot: "stat1_value", label: "1 reikšmė", fallback: "10+" },
      { slot: "stat1_label", label: "1 paaiškinimas", fallback: "metų klinikinės patirties" },
      { slot: "stat2_value", label: "2 reikšmė", fallback: "Optika" },
      { slot: "stat2_label", label: "2 paaiškinimas", fallback: "naudojama kiekvienam vizitui" },
      { slot: "stat3_value", label: "3 reikšmė", fallback: "Koferdamas" },
      { slot: "stat3_label", label: "3 paaiškinimas", fallback: "gydymo ilgaamžiškumui" },
      { slot: "stat_cta_text", label: "Kvietimo tekstas", fallback: "Turite klausimą?" },
      { slot: "stat_cta_button", label: "Kvietimo mygtukas", fallback: "Parašykite →" },
    ],
  },
  {
    title: "Paslaugų sekcija",
    note: "Pačios paslaugų kortelės bus tvarkomos atskirame skyriuje „Paslaugos“.",
    fields: [
      {
        slot: "services_heading",
        label: "Antraštė",
        fallback: "Viskas, ko reikia dantų sveikatai,",
      },
      {
        slot: "services_heading_soft",
        label: "Antraštės tęsinys (šviesus)",
        fallback: "vienoje ramioje vietoje.",
      },
      {
        slot: "services_lead",
        label: "Įžanga",
        fallback:
          "Nuo kasdienės profilaktikos iki sudėtingesnio atstatymo — sprendimas visada aptariamas kartu.",
        multiline: true,
      },
    ],
  },
  {
    title: "Žmogiškas požiūris",
    fields: [
      { slot: "touch_eyebrow", label: "Viršutinė eilutė", fallback: "Kitoks vizito jausmas" },
      { slot: "touch_heading", label: "Antraštė", fallback: "Klinikinė kompetencija su" },
      { slot: "touch_heading_mark", label: "Paryškintas žodis", fallback: "žmogišku" },
      { slot: "touch_heading_end", label: "Antraštės pabaiga", fallback: "požiūriu." },
      {
        slot: "touch_lede",
        label: "Tekstas",
        fallback:
          "Prieš pradedant gydymą, aptariama, kas bus daroma ir kodėl. Sprendimai renkami taip, kad būtų išsaugota kuo daugiau savo danties audinių.",
        multiline: true,
      },
      {
        slot: "touch_quote",
        label: "Citata ant nuotraukos",
        fallback: "„Gydymas turi būti aiškus, ramus ir niekada skubotas.“",
        multiline: true,
      },
      {
        slot: "touch_point1",
        label: "1 punktas",
        fallback: "Aiškiai paaiškintas planas ir kaina",
      },
      { slot: "touch_point2", label: "2 punktas", fallback: "Minimaliai invazyvūs sprendimai" },
      {
        slot: "touch_point3",
        label: "3 punktas",
        fallback: "Rami aplinka nerimaujantiems pacientams",
      },
      { slot: "touch_cta", label: "Mygtukas", fallback: "Apie mane →" },
    ],
  },
  {
    title: "Kvietimo juosta",
    fields: [
      { slot: "cta_heading", label: "Antraštė", fallback: "Sveikos šypsenos link — vienu vizitu." },
      {
        slot: "cta_text",
        label: "Tekstas",
        fallback:
          "Vizito laiką suderinkite telefonu arba žinute. Priėmimas — Braškių g. 2B-1, Vilnius.",
        multiline: true,
      },
      { slot: "cta_button", label: "Mygtukas", fallback: "Registruotis vizitui →" },
    ],
  },
];

function HomeEditor() {
  const { data, isLoading } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;

  const fetchRole = useServerFn(getMyRole);
  const { data: me } = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}) });
  const isDeveloper = me?.role === "developer";

  const valueOf = (slot: string) => content.text[`${PAGE}:${slot}:lt`] ?? "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Pradžios puslapis</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Keiskite pradžios puslapio tekstus ir nuotraukas. Palikus lauką tuščią, rodomas
          numatytasis tekstas.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : (
        <>
          <section className="space-y-4 rounded-xl border border-border/70 p-5">
            <h2 className="text-lg font-medium">Nuotraukos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <PageImageSlot
                page={PAGE}
                slot="hero_portrait"
                label="Portretas pirmame ekrane"
                hint="Vertikali nuotrauka, geriausiai 900×1100 px."
                ratio="3 / 3.7"
                chosen={content.media[`${PAGE}:hero_portrait`] ?? null}
                fallback={content.defaults[`${PAGE}:hero_portrait`] ?? null}
                isDeveloper={isDeveloper}
              />
              <PageImageSlot
                page={PAGE}
                slot="touch_photo"
                label="Nuotrauka sekcijoje „Žmogiškas požiūris“"
                hint="Beveik kvadratinė nuotrauka, pvz. 900×950 px."
                ratio="1 / 1.05"
                chosen={content.media[`${PAGE}:touch_photo`] ?? null}
                fallback={content.defaults[`${PAGE}:touch_photo`] ?? null}
                isDeveloper={isDeveloper}
              />
            </div>
          </section>

          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-5 rounded-xl border border-border/70 p-5">
              <div>
                <h2 className="text-lg font-medium">{section.title}</h2>
                {section.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{section.note}</p>
                ) : null}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {section.fields.map((field) => (
                  <PageTextField
                    key={field.slot}
                    page={PAGE}
                    slot={field.slot}
                    label={field.label}
                    fallback={field.fallback}
                    multiline={field.multiline ?? false}
                    value={valueOf(field.slot)}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
