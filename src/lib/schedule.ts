/**
 * Shared calendar helpers. Times inside working hours and exceptions are stored
 * as minutes from midnight (local practice time); appointments are stored as
 * absolute timestamps and rendered in the visitor's local time.
 */

export type WorkingHour = {
  id: string;
  weekday: number; // 1 = Monday .. 7 = Sunday
  start_min: number;
  end_min: number;
};

export type ScheduleException = {
  id: string;
  day: string; // YYYY-MM-DD
  kind: "closed" | "open";
  start_min: number | null;
  end_min: number | null;
  note: string;
};

export type Appointment = {
  id: string;
  service_id: string | null;
  service_title: string;
  starts_at: string;
  ends_at: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  note: string;
  status: "pending" | "confirmed" | "arrived" | "no_show" | "cancelled";
  kind: "appointment" | "block";
  source: "admin" | "web";
};

export type BusyInterval = { startsAt: string; endsAt: string };

export type Interval = { start: number; end: number };

export const WEEKDAYS = [
  "Pirmadienis",
  "Antradienis",
  "Trečiadienis",
  "Ketvirtadienis",
  "Penktadienis",
  "Šeštadienis",
  "Sekmadienis",
] as const;

export const WEEKDAYS_SHORT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"] as const;

export const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

export const STATUS_LABEL: Record<Appointment["status"], string> = {
  pending: "Laukia patvirtinimo",
  confirmed: "Patvirtintas",
  arrived: "Atvyko",
  no_show: "Neatvyko",
  cancelled: "Atšauktas",
};

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function minToHHMM(min: number) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

export function hhmmToMin(value: string): number {
  const [h = "0", m = "0"] = value.split(":");
  return Math.max(0, Math.min(1440, Number(h) * 60 + Number(m)));
}

/** YYYY-MM-DD in local time. */
export function ymd(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday 00:00 of the week the date falls into. */
export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const iso = d.getDay() === 0 ? 7 : d.getDay();
  return addDays(d, 1 - iso);
}

export function isoWeekday(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

export function weekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** Local Date built from a YYYY-MM-DD day and minutes from midnight. */
export function dayTime(day: string, minutes: number) {
  const [y = "1970", m = "01", d = "01"] = day.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  date.setMinutes(minutes);
  return date;
}

export function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Genitive month names ("rugsėjo 9 d."). */
export const MONTHS_GENITIVE = [
  "sausio",
  "vasario",
  "kovo",
  "balandžio",
  "gegužės",
  "birželio",
  "liepos",
  "rugpjūčio",
  "rugsėjo",
  "spalio",
  "lapkričio",
  "gruodžio",
] as const;

/** Nominative month names ("rugsėjis"). */
export const MONTHS_NOMINATIVE = [
  "sausis",
  "vasaris",
  "kovas",
  "balandis",
  "gegužė",
  "birželis",
  "liepa",
  "rugpjūtis",
  "rugsėjis",
  "spalis",
  "lapkritis",
  "gruodis",
] as const;

export const MONTHS_SHORT = [
  "sau.",
  "vas.",
  "kov.",
  "bal.",
  "geg.",
  "birž.",
  "liep.",
  "rugp.",
  "rugs.",
  "spal.",
  "lapkr.",
  "gruod.",
] as const;

export function formatDayLabel(date: Date) {
  return `${WEEKDAYS[isoWeekday(date) - 1]}, ${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

export function isSameDay(a: Date, b: Date) {
  return ymd(a) === ymd(b);
}

export function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** Full Monday-first grid covering the month (always whole weeks). */
export function monthGridDays(anchor: Date): Date[] {
  const first = startOfWeek(startOfMonth(anchor));
  const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const total = Math.ceil((lastOfMonth.getTime() - first.getTime()) / 86400000 + 1);
  const weeks = Math.ceil(total / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));
}

export type CalendarView = "day" | "week" | "month";

/** Human range label for the calendar toolbar. */
export function formatRangeLabel(view: CalendarView, anchor: Date): string {
  const year = anchor.getFullYear();
  if (view === "day") {
    return `${WEEKDAYS[isoWeekday(anchor) - 1]}, ${year} m. ${
      MONTHS_GENITIVE[anchor.getMonth()]
    } ${anchor.getDate()} d.`;
  }
  if (view === "month") {
    return `${year} m. ${MONTHS_NOMINATIVE[anchor.getMonth()]}`;
  }
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()} m. ${MONTHS_GENITIVE[start.getMonth()]} ${start.getDate()}–${end.getDate()} d.`;
  }
  const startPart = `${MONTHS_GENITIVE[start.getMonth()]} ${start.getDate()}`;
  const endPart = `${MONTHS_GENITIVE[end.getMonth()]} ${end.getDate()} d.`;
  return `${end.getFullYear()} m. ${startPart} – ${endPart}`;
}


function mergeIntervals(list: Interval[]): Interval[] {
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const out: Interval[] = [];
  for (const item of sorted) {
    const last = out[out.length - 1];
    if (last && item.start <= last.end) last.end = Math.max(last.end, item.end);
    else out.push({ ...item });
  }
  return out;
}

function subtract(base: Interval[], cuts: Interval[]): Interval[] {
  let result = base;
  for (const cut of cuts) {
    const next: Interval[] = [];
    for (const item of result) {
      if (cut.end <= item.start || cut.start >= item.end) {
        next.push(item);
        continue;
      }
      if (cut.start > item.start) next.push({ start: item.start, end: cut.start });
      if (cut.end < item.end) next.push({ start: cut.end, end: item.end });
    }
    result = next;
  }
  return result.filter((i) => i.end > i.start);
}

/** Open intervals (minutes from midnight) for one day. */
export function openIntervalsFor(
  day: Date,
  hours: WorkingHour[],
  exceptions: ScheduleException[],
): Interval[] {
  const key = ymd(day);
  const dayExceptions = exceptions.filter((e) => e.day === key);
  const closedAll = dayExceptions.some(
    (e) => e.kind === "closed" && (e.start_min === null || e.end_min === null),
  );

  const extra = dayExceptions
    .filter((e) => e.kind === "open" && e.start_min !== null && e.end_min !== null)
    .map((e) => ({ start: e.start_min as number, end: e.end_min as number }));

  if (closedAll) return mergeIntervals(extra);

  const weekday = isoWeekday(day);
  const base = hours
    .filter((h) => h.weekday === weekday)
    .map((h) => ({ start: h.start_min, end: h.end_min }));

  const cuts = dayExceptions
    .filter((e) => e.kind === "closed" && e.start_min !== null && e.end_min !== null)
    .map((e) => ({ start: e.start_min as number, end: e.end_min as number }));

  return mergeIntervals(subtract(mergeIntervals([...base, ...extra]), cuts));
}

/** Busy minute ranges of one day, from absolute appointment timestamps. */
export function busyIntervalsFor(day: Date, busy: BusyInterval[]): Interval[] {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = addDays(dayStart, 1);

  const out: Interval[] = [];
  for (const item of busy) {
    const start = new Date(item.startsAt);
    const end = new Date(item.endsAt);
    if (end <= dayStart || start >= dayEnd) continue;
    out.push({
      start: Math.max(0, (Math.max(start.getTime(), dayStart.getTime()) - dayStart.getTime()) / 60000),
      end: Math.min(1440, (Math.min(end.getTime(), dayEnd.getTime()) - dayStart.getTime()) / 60000),
    });
  }
  return mergeIntervals(out);
}

/**
 * Free slots of `step` minutes inside the open intervals, skipping busy time.
 * `now` is passed in explicitly: during SSR it must be null so the server and
 * the first client render agree (hydration), and the client fills it after mount.
 */
export function freeSlotsFor(
  day: Date,
  hours: WorkingHour[],
  exceptions: ScheduleException[],
  busy: BusyInterval[],
  step = 30,
  now: Date | null = null,
): Interval[] {
  // Days already gone offer nothing; only the current day needs hour filtering.
  if (now && ymd(day) < ymd(now)) return [];
  const open = openIntervalsFor(day, hours, exceptions);
  const taken = busyIntervalsFor(day, busy);
  const isToday = now ? ymd(day) === ymd(now) : false;
  const nowMin = now ? minutesOfDay(now) : 0;

  const slots: Interval[] = [];
  for (const interval of open) {
    for (let start = interval.start; start + step <= interval.end; start += step) {
      const end = start + step;
      if (isToday && start <= nowMin) continue;
      const overlaps = taken.some((b) => start < b.end && end > b.start);
      if (!overlaps) slots.push({ start, end });
    }
  }
  return slots;
}

