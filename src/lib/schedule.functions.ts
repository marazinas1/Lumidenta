import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { BusyInterval, ScheduleException, WorkingHour } from "./schedule";

/**
 * Public schedule read. Working hours and exceptions are public rows; busy
 * intervals are projected to time only — never a name, phone or e-mail.
 */

export type PublicSchedule = {
  hours: WorkingHour[];
  exceptions: ScheduleException[];
  busy: BusyInterval[];
};

export const emptySchedule: PublicSchedule = { hours: [], exceptions: [], busy: [] };

const rangeInput = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const fetchPublicSchedule = createServerFn({ method: "GET" })
  .inputValidator((d) => rangeInput.parse(d))
  .handler(async ({ data }): Promise<PublicSchedule> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return emptySchedule;

    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const fromTs = new Date(`${data.from}T00:00:00`).toISOString();
    const toTs = new Date(`${data.to}T23:59:59`).toISOString();

    const [hoursRes, exceptionsRes] = await Promise.all([
      supabase.from("working_hours").select("id, weekday, start_min, end_min"),
      supabase
        .from("schedule_exceptions")
        .select("id, day, kind, start_min, end_min, note")
        .gte("day", data.from)
        .lte("day", data.to),
    ]);

    // Appointment rows are staff-only, so the busy list is read with the
    // service role and stripped down to bare time ranges before it leaves.
    let busy: BusyInterval[] = [];
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows } = await supabaseAdmin
        .from("appointments")
        .select("starts_at, ends_at")
        .in("status", ["pending", "confirmed"])
        .gte("starts_at", fromTs)
        .lte("starts_at", toTs);
      busy = (rows ?? []).map((r: { starts_at: string; ends_at: string }) => ({
        startsAt: r.starts_at,
        endsAt: r.ends_at,
      }));
    } catch (error) {
      console.error("[schedule] busy read failed", error);
    }

    return {
      hours: (hoursRes.data ?? []) as WorkingHour[],
      exceptions: (exceptionsRes.data ?? []) as ScheduleException[],
      busy,
    };
  });
