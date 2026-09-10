import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper, assertOwner, assertStaff } from "./users.server";

export type DefaultTextRequestStatus = "pending" | "approved" | "declined";

export type DefaultTextRequest = {
  id: string;
  page: string;
  slot: string;
  locale: string;
  requested_text: string;
  status: DefaultTextRequestStatus;
  requested_by: string;
  resolved_by: string | null;
  resolved_at: string | null;
  seen_by_requester: boolean;
  created_at: string;
};

const COLUMNS =
  "id, page, slot, locale, requested_text, status, requested_by, resolved_by, resolved_at, seen_by_requester, created_at";

const slotKey = z.object({
  page: z.string().trim().min(1).max(64),
  slot: z.string().trim().min(1).max(64),
  locale: z.enum(["lt", "en"]).default("lt"),
});

/** Everything the caller may see: their own requests, or all of them for a developer. */
export const listDefaultTextRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DefaultTextRequest[]> => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("default_text_requests")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as DefaultTextRequest[];
  });

/** Owner asks for their wording to be locked in. Nothing on the site changes yet. */
export const createDefaultTextRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => slotKey.extend({ value: z.string().max(20000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { page, slot, locale, value } = data;

    // One open request per field: replace any earlier pending one.
    await context.supabase
      .from("default_text_requests")
      .delete()
      .match({ page, slot, locale, status: "pending" });

    const { error } = await context.supabase.from("default_text_requests").insert({
      page,
      slot,
      locale,
      requested_text: value,
      requested_by: context.userId,
    });
    if (error) throw new Error(error.message);

    const claims = context.claims as { email?: string } | null;
    const { notifyDevelopersOfDefaultRequest } = await import("./default-requests.server");
    await notifyDevelopersOfDefaultRequest({
      page,
      slot,
      locale,
      value,
      requesterEmail: claims?.email ?? null,
    });

    return { ok: true as const };
  });

/** Developer only: approve (lock the wording in) or decline. */
export const resolveDefaultTextRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), approve: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context);

    const { data: row, error } = await context.supabase
      .from("default_text_requests")
      .select(COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Prašymas nerastas");
    const request = row as unknown as DefaultTextRequest;
    if (request.status !== "pending") return { ok: true as const };

    if (data.approve) {
      await pinDefault(context, request.page, request.slot, request.locale, request.requested_text);
    }

    const { error: writeError } = await context.supabase
      .from("default_text_requests")
      .update({
        status: data.approve ? "approved" : "declined",
        resolved_by: context.userId,
        resolved_at: new Date().toISOString(),
        seen_by_requester: false,
      })
      .eq("id", data.id);
    if (writeError) throw new Error(writeError.message);

    return { ok: true as const };
  });

/** Developer only: lock wording in directly, without going through a request. */
export const pinDefaultText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => slotKey.extend({ value: z.string().max(20000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context);
    await pinDefault(context, data.page, data.slot, data.locale, data.value);
    return { ok: true as const };
  });

/** The requester acknowledges the answers they have read. */
export const markDefaultTextRequestsSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.ids.length === 0) return { ok: true as const };
    const { error } = await context.supabase
      .from("default_text_requests")
      .update({ seen_by_requester: true })
      .in("id", data.ids)
      .eq("requested_by", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * Writing the default and clearing the matching override in one step: the page
 * keeps showing the same words, but now they are the value everyone falls back
 * to when the owner presses "Atstatyti numatytąjį".
 */
async function pinDefault(
  context: { supabase: { from: (t: string) => any } },
  page: string,
  slot: string,
  locale: string,
  value: string,
) {
  const { error } = await context.supabase
    .from("page_text_defaults")
    .upsert({ page, slot, locale, value }, { onConflict: "page,slot,locale" });
  if (error) throw new Error(error.message);

  const { error: clearError } = await context.supabase
    .from("page_text")
    .delete()
    .match({ page, slot, locale });
  if (clearError) throw new Error(clearError.message);
}
