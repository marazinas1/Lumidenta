import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { openIntervalsFor, type ScheduleException, type WorkingHour } from "./schedule";

/**
 * Public appointment request. Anyone may call this, so everything is
 * re-validated on the server: the slot must be inside working hours, free,
 * in the future, and the requester must pass simple anti-spam checks.
 * The row is always created as `pending` — nothing is auto-confirmed.
 */

const input = z.object({
  serviceId: z.string().uuid().nullable().default(null),
  startsAt: z.string().min(10).max(40),
  durationMin: z.number().int().min(10).max(480),
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(60),
  email: z.union([z.string().trim().email().max(200), z.literal("")]).default(""),
  note: z.string().trim().max(1000).default(""),
  consent: z.literal(true),
  // Honeypot + minimal fill time: cheap bot filters, invisible to people.
  company: z.string().max(200).default(""),
  elapsedMs: z.number().int().min(0).default(0),
});

const DAY_MS = 86_400_000;

function fail(message: string): never {
  throw new Error(message);
}

export const requestAppointment = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }) => {
    if (data.company.trim() !== "") fail("Užklausos išsiųsti nepavyko.");
    if (data.elapsedMs < 2500) fail("Palaukite akimirką ir bandykite dar kartą.");

    const start = new Date(data.startsAt);
    if (Number.isNaN(start.getTime())) fail("Neteisingas laikas.");
    const end = new Date(start.getTime() + data.durationMin * 60_000);
    if (start.getTime() < Date.now() + 30 * 60_000) {
      fail("Šis laikas jau praėjo. Pasirinkite kitą.");
    }
    if (start.getTime() > Date.now() + 120 * DAY_MS) fail("Per tolimas laikas.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Requests nobody answered for 48 h free the slot again.
    const { releaseStalePending } = await import("./booking.server");
    await releaseStalePending();

    // --- rate limits -------------------------------------------------------
    const since = new Date(Date.now() - DAY_MS).toISOString();
    const { count: recent } = await supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("source", "web")
      .eq("patient_phone", data.phone)
      .gte("created_at", since);
    if ((recent ?? 0) >= 3) {
      fail("Iš šio numerio šiandien jau gauta užklausų. Susisiekite telefonu.");
    }
    const { count: active } = await supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("source", "web")
      .eq("patient_phone", data.phone)
      .eq("status", "pending");
    if ((active ?? 0) >= 2) {
      fail("Turite laukiančių patvirtinimo užklausų. Palaukite atsakymo.");
    }

    // --- slot must really be open and free ---------------------------------
    const dayKey = vilniusDay(start);
    const [hoursRes, exceptionsRes] = await Promise.all([
      supabaseAdmin.from("working_hours").select("id, weekday, start_min, end_min"),
      supabaseAdmin
        .from("schedule_exceptions")
        .select("id, day, kind, start_min, end_min, note")
        .eq("day", dayKey),
    ]);

    const open = openIntervalsFor(
      new Date(`${dayKey}T12:00:00Z`),
      (hoursRes.data ?? []) as WorkingHour[],
      (exceptionsRes.data ?? []) as ScheduleException[],
    );
    const startMin = vilniusMinutes(start);
    const endMin = startMin + data.durationMin;
    const insideOpen = open.some((i) => startMin >= i.start && endMin <= i.end);
    if (!insideOpen) fail("Šis laikas nebėra siūlomas. Pasirinkite kitą.");

    const { data: clashes } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .in("status", ["pending", "confirmed"])
      .lt("starts_at", end.toISOString())
      .gt("ends_at", start.toISOString())
      .limit(1);
    if ((clashes ?? []).length > 0) fail("Šis laikas ką tik buvo užimtas. Pasirinkite kitą.");

    // --- create the request ------------------------------------------------
    let serviceTitle = "Konsultacija";
    if (data.serviceId) {
      const { data: service } = await supabaseAdmin
        .from("services")
        .select("title")
        .eq("id", data.serviceId)
        .maybeSingle();
      if (service?.title) serviceTitle = service.title;
    }

    const { error } = await supabaseAdmin.from("appointments").insert({
      service_id: data.serviceId,
      service_title: serviceTitle,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      patient_name: data.name,
      patient_phone: data.phone,
      patient_email: data.email,
      note: data.note,
      status: "pending",
      kind: "appointment",
      source: "web",
    });
    if (error) {
      console.error("[booking] insert failed", error.message);
      fail("Šis laikas ką tik buvo užimtas. Pasirinkite kitą.");
    }

    // Notifying the practice must never break a successful request.
    try {
      const { notifyNewAppointment } = await import("./booking.server");
      await notifyNewAppointment({
        serviceTitle,
        startsAt: start.toISOString(),
        name: data.name,
        phone: data.phone,
        email: data.email,
        note: data.note,
      });
    } catch (notifyError) {
      console.error("[booking] notify failed", notifyError);
    }

    return { ok: true as const };
  });

/** YYYY-MM-DD of an instant in practice time. */
function vilniusDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

/** Minutes from midnight of an instant in practice time. */
function vilniusMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  const [h = "0", m = "0"] = parts.split(":");
  return Number(h) * 60 + Number(m);
}
