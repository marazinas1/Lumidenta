import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Reveal, RevealItems } from "@/components/site/Reveal";
import { getContent } from "@/content";
import { useCatalog, ensureCatalog } from "@/lib/catalog";
import type { Locale } from "@/lib/locale";
import { SITE_URL } from "@/data/nav";
import { emptySchedule, fetchPublicSchedule } from "@/lib/schedule.functions";
import {
  addDays,
  formatDayLabel,
  freeSlotsFor,
  minToHHMM,
  openIntervalsFor,
  startOfWeek,
  weekDays,
  ymd,
} from "@/lib/schedule";

/** Two weeks ahead is enough for a solo practice and keeps the page light. */
function range() {
  const start = startOfWeek(new Date());
  return { from: ymd(start), to: ymd(addDays(start, 13)) };
}

export const scheduleQuery = () => {
  const { from, to } = range();
  return queryOptions({
    queryKey: ["public-schedule", from, to],
    queryFn: async () => {
      try {
        return await fetchPublicSchedule({ data: { from, to } });
      } catch (error) {
        console.error("[schedule] fetch failed", error);
        return emptySchedule;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
};

export function ensureSchedule(context: { queryClient: QueryClient }) {
  return context.queryClient.ensureQueryData(scheduleQuery()).catch(() => emptySchedule);
}

export function bookingRoute(locale: Locale) {
  const c = getContent(locale);
  const url = `${SITE_URL}/registracija`;
  return {
    loader: async ({ context }: { context: { queryClient: QueryClient } }) => {
      await Promise.all([ensureCatalog(context), ensureSchedule(context)]);
      return null;
    },
    head: () => ({
      meta: [
        { title: `Registracija vizitui — ${c.common.brand}` },
        {
          name: "description",
          content:
            "Laisvi vizito laikai artimiausioms savaitėms. Pasirinkite Jums tinkantį laiką ir susisiekite telefonu arba el. paštu.",
        },
        { property: "og:title", content: `Registracija vizitui — ${c.common.brand}` },
        {
          property: "og:description",
          content: "Laisvi vizito laikai artimiausioms savaitėms Lumidenta odontologijos kabinete.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    }),
    component: () => <BookingPage />,
  };
}

function BookingPage() {
  const { settings } = useCatalog();
  const { data } = useQuery(scheduleQuery());
  const schedule = data ?? emptySchedule;
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = weekDays(weekStart);

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">Registracija</div>
          <h1>Laisvi vizito laikai.</h1>
          <p className="lead">
            Žemiau matote, kada dirbu ir kurie laikai dar laisvi. Pasirinkę Jums tinkantį laiką,
            paskambinkite arba parašykite — vizitą patvirtinsiu asmeniškai.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          <Reveal>
            <div className="sched-toolbar">
              <button
                type="button"
                className="sched-nav"
                onClick={() => setWeekOffset((v) => Math.max(0, v - 1))}
                disabled={weekOffset === 0}
              >
                ← Ankstesnė savaitė
              </button>
              <span className="sched-range">
                {formatDayLabel(days[0] as Date)} – {formatDayLabel(days[6] as Date)}
              </span>
              <button
                type="button"
                className="sched-nav"
                onClick={() => setWeekOffset((v) => Math.min(1, v + 1))}
                disabled={weekOffset === 1}
              >
                Kita savaitė →
              </button>
            </div>
          </Reveal>

          <RevealItems className="sched-grid">
            {days.map((day) => {
              const open = openIntervalsFor(day, schedule.hours, schedule.exceptions);
              const free = freeSlotsFor(day, schedule.hours, schedule.exceptions, schedule.busy);
              return (
                <div key={ymd(day)} className="sched-day">
                  <h2>{formatDayLabel(day)}</h2>
                  {open.length === 0 ? (
                    <p className="sched-closed">Nedirbama</p>
                  ) : (
                    <>
                      <p className="sched-hours">
                        {open.map((i) => `${minToHHMM(i.start)}–${minToHHMM(i.end)}`).join(", ")}
                      </p>
                      {free.length === 0 ? (
                        <p className="sched-closed">Visi laikai užimti</p>
                      ) : (
                        <div className="sched-slots">
                          {free.map((slot) => (
                            <span key={slot.start} className="sched-slot">
                              {minToHHMM(slot.start)}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </RevealItems>

          <Reveal>
            <div className="sched-cta">
              <h2>Radote tinkamą laiką?</h2>
              <p>
                Registracija kol kas vyksta telefonu arba el. paštu — taip įsitikinu, kad vizito
                trukmė atitinka Jūsų poreikį.
              </p>
              <div className="sched-cta-links">
                {settings.phone ? (
                  <a className="btn" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                    {settings.phone}
                  </a>
                ) : null}
                {settings.email ? (
                  <a className="btn ghost" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
