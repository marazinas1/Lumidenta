import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { enGB, lt } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { ArrowRight } from "lucide-react";

import { Enso } from "@/components/site/Enso";
import { LocaleLink } from "@/components/site/LocaleLink";
import { Calendar } from "@/components/ui/calendar";
import { useContent, useLocale } from "@/content";
import { availabilityQuery } from "@/lib/availability-queries";
import type { AvailabilityGroup } from "@/lib/availability-schemas";
import { toApiDate } from "@/components/stay/AvailabilityCalendar";
import { categoryLabel, categorySlug } from "@/lib/property-category";
import { formatPrice } from "@/lib/property-view";
import { cn } from "@/lib/utils";

const KNOWN_ORDER = ["standard", "terrace", "cottage"];

function freeLabel(count: number, common: ReturnType<typeof useContent>["common"]): string {
  const last = count % 10;
  const lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) return common.availabilityBand.freeOne;
  if (last === 0 || (lastTwo >= 11 && lastTwo <= 19)) return common.availabilityBand.freeMany;
  return common.availabilityBand.freeFew;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function AvailabilityBand() {
  const { common } = useContent();
  const locale = useLocale();
  const today = useMemo(startOfToday, []);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [adults, setAdults] = useState(2);

  const dateFrom = range?.from ? toApiDate(range.from) : undefined;
  const dateTo = range?.to ? toApiDate(range.to) : undefined;

  const { data, isFetching, isError, refetch } = useQuery(
    availabilityQuery(dateFrom, dateTo, adults),
  );

  const groups = useMemo(() => {
    const list = data?.groups ? [...data.groups] : [];
    list.sort((a, b) => {
      const ai = KNOWN_ORDER.indexOf(a.code);
      const bi = KNOWN_ORDER.indexOf(b.code);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.code.localeCompare(b.code);
    });
    return list;
  }, [data]);

  const ready = Boolean(dateFrom && dateTo);

  return (
    <section id="laisvos-datos" className="scroll-mt-24 bg-linen px-6 pt-24 pb-14 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="label-caps text-sage">{common.availabilityBand.eyebrow}</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,2.625rem)] leading-tight font-medium text-ink">
            {common.availabilityBand.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone sm:text-lg">
            {common.availabilityBand.lead}
          </p>
        </div>

        <div className="mt-10 grid gap-8 rounded-2xl bg-warm-white p-6 shadow-soft sm:p-8 lg:grid-cols-[auto_1fr]">
          <div>
            <Calendar
              mode="range"
              locale={locale === "en" ? enGB : lt}
              weekStartsOn={1}
              numberOfMonths={1}
              selected={range}
              onSelect={setRange}
              min={1}
              disabled={{ before: today }}
              startMonth={today}
              className="pointer-events-auto [--cell-size:2.5rem] sm:[--cell-size:2.8rem]"
              classNames={{
                month: "flex w-full flex-col gap-4",
                caption_label: "font-display text-lg font-medium capitalize text-ink",
                weekday:
                  "flex-1 select-none text-[0.7rem] uppercase tracking-[0.12em] text-stone/70",
              }}
            />
            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5">
              <label className="flex items-center gap-3 text-sm text-stone">
                {common.availabilityBand.guests}
                <select
                  value={adults}
                  onChange={(event) => setAdults(Number(event.target.value))}
                  className="rounded-full border border-border bg-warm-white px-4 py-1.5 text-sm text-ink"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              {range?.from ? (
                <button
                  type="button"
                  onClick={() => setRange(undefined)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs text-stone transition-colors hover:text-ink"
                >
                  {common.availabilityBand.reset}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {!ready ? (
              <div className="flex items-center gap-4 text-stone">
                <Enso className="hidden h-8 w-8 shrink-0 text-sage sm:block" />
                <p className="text-sm leading-relaxed">{common.availabilityBand.pickDates}</p>
              </div>
            ) : isError ? (
              <div className="text-sm text-stone">
                <p>{common.availabilityBand.error}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 rounded-full bg-sage px-5 py-2 text-xs font-medium text-warm-white transition-colors hover:bg-sage-deep"
                >
                  {common.availabilityBand.retry}
                </button>
              </div>
            ) : isFetching || !data ? (
              <p className="text-sm text-stone">{common.availabilityBand.checking}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {groups.map((group) => (
                  <AvailabilityTypeCard
                    key={group.code}
                    group={group}
                    nights={data.nights}
                    dateFrom={dateFrom as string}
                    dateTo={dateTo as string}
                    adults={adults}
                    common={common}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AvailabilityTypeCard({
  group,
  nights,
  dateFrom,
  dateTo,
  adults,
  common,
  locale,
}: {
  group: AvailabilityGroup;
  nights: number;
  dateFrom: string;
  dateTo: string;
  adults: number;
  common: ReturnType<typeof useContent>["common"];
  locale: ReturnType<typeof useLocale>;
}) {
  const label = categoryLabel(group.code, locale);
  const free = group.free_count > 0;

  const body = (
    <>
      <h3 className="font-display text-lg leading-snug font-semibold text-ink">{label}</h3>
      <p className={cn("mt-3 text-sm", free ? "text-sage-deep" : "text-stone/70")}>
        {free
          ? `${group.free_count} ${freeLabel(group.free_count, common)} ${common.availabilityBand.ofTotal} ${group.total_count}`
          : common.availabilityBand.none}
      </p>
      <p className="mt-2 text-sm text-stone">
        {free && group.price_from !== null
          ? `${common.labels.priceFrom} ${formatPrice(group.price_from)} € ${common.availabilityBand.priceFor} ${nights} ${nights === 1 ? common.stays.night : common.stays.nights}`
          : "—"}
      </p>
      {free ? (
        <span className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sage">
          {common.categoryCard.viewOptions}
          <ArrowRight className="arrow-nudge h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </>
  );

  if (!free) {
    return (
      <article className="rounded-2xl border border-border bg-linen/60 p-5 opacity-70">
        {body}
      </article>
    );
  }

  return (
    <LocaleLink
      to="/apartamentai/tipas/$categorySlug"
      params={{ categorySlug: categorySlug(group.code) }}
      search={{ nuo: dateFrom, iki: dateTo, sveciai: adults }}
      className="group rounded-2xl border border-border bg-linen/60 p-5 transition-shadow hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      {body}
    </LocaleLink>
  );
}