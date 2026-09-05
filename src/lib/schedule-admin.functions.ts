import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertOwner, assertStaff } from "./users.server";

/** Calendar management. Staff may read; only owner/developer may change. */

const idInput = z.object({ id: z.string().uuid() });

const rangeInput = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/* ------------------------------------------------------------------ reads */

export const listWorkingHours = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("working_hours")
      .select("*")
      .order("weekday", { ascending: true })
      .order("start_min", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listScheduleExceptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("schedule_exceptions")
      .select("*")
      .order("day", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => rangeInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { data: rows, error } = await context.supabase
      .from("appointments")
      .select("*")
      .gte("starts_at", new Date(`${data.from}T00:00:00`).toISOString())
      .lte("starts_at", new Date(`${data.to}T23:59:59`).toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/* ------------------------------------------------------------------ working hours */

const hourRow = z.object({
  weekday: z.number().int().min(1).max(7),
  start_min: z.number().int().min(0).max(1440),
  end_min: z.number().int().min(0).max(1440),
});

/** Replaces the whole weekly pattern in one save — simplest thing to reason about. */
export const saveWorkingHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ rows: z.array(hourRow).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const rows = data.rows.filter((r) => r.end_min > r.start_min);

    const { error: delError } = await context.supabase
      .from("working_hours")
      .delete()
      .not("id", "is", null);
    if (delError) throw new Error(delError.message);

    if (rows.length > 0) {
      const { error } = await context.supabase.from("working_hours").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true, count: rows.length };
  });

/* ------------------------------------------------------------------ exceptions */

const exceptionFields = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["closed", "open"]).default("closed"),
  start_min: z.number().int().min(0).max(1440).nullable().default(null),
  end_min: z.number().int().min(0).max(1440).nullable().default(null),
  note: z.string().trim().max(300).default(""),
});

export const saveScheduleException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => exceptionFields.extend({ id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { id, ...fields } = data;
    if (fields.kind === "open" && (fields.start_min === null || fields.end_min === null)) {
      throw new Error("Papildomam darbo laikui reikia nurodyti pradžią ir pabaigą.");
    }
    if (
      fields.start_min !== null &&
      fields.end_min !== null &&
      fields.end_min <= fields.start_min
    ) {
      throw new Error("Pabaigos laikas turi būti vėlesnis už pradžios.");
    }
    const query = id
      ? context.supabase.from("schedule_exceptions").update(fields).eq("id", id)
      : context.supabase.from("schedule_exceptions").insert(fields);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteScheduleException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase
      .from("schedule_exceptions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ appointments */

const appointmentFields = z.object({
  service_id: z.string().uuid().nullable().default(null),
  service_title: z.string().trim().max(200).default(""),
  starts_at: z.string().min(10).max(40),
  ends_at: z.string().min(10).max(40),
  patient_name: z.string().trim().max(160).default(""),
  patient_phone: z.string().trim().max(60).default(""),
  patient_email: z.string().trim().max(200).default(""),
  note: z.string().trim().max(2000).default(""),
  status: z.enum(["pending", "confirmed", "arrived", "no_show", "cancelled"]).default("confirmed"),
  kind: z.enum(["appointment", "block"]).default("appointment"),
});

function friendly(message: string) {
  if (message.includes("appointments_no_overlap")) {
    return "Šis laikas kertasi su kitu vizitu.";
  }
  if (message.includes("appointments_range")) {
    return "Pabaigos laikas turi būti vėlesnis už pradžios.";
  }
  return message;
}

export const saveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => appointmentFields.extend({ id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { id, ...fields } = data;
    if (new Date(fields.ends_at) <= new Date(fields.starts_at)) {
      throw new Error("Pabaigos laikas turi būti vėlesnis už pradžios.");
    }
    const query = id
      ? context.supabase.from("appointments").update(fields).eq("id", id)
      : context.supabase.from("appointments").insert({ ...fields, source: "admin" });
    const { error } = await query;
    if (error) throw new Error(friendly(error.message));
    return { ok: true };
  });

/** Used by drag and resize — moves a visit without touching its details. */
export const moveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        starts_at: z.string().min(10).max(40),
        ends_at: z.string().min(10).max(40),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { id, ...fields } = data;
    const { error } = await context.supabase.from("appointments").update(fields).eq("id", id);
    if (error) throw new Error(friendly(error.message));
    return { ok: true };
  });

export const setAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "arrived", "no_show", "cancelled"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase
      .from("appointments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(friendly(error.message));
    return { ok: true };
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase.from("appointments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
