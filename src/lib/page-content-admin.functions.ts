import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper, assertStaff } from "./users.server";

const slotKey = z.object({
  page: z.string().trim().min(1).max(64),
  slot: z.string().trim().min(1).max(64),
});

const mediaInput = slotKey.extend({
  bucket: z.string().trim().min(1).max(64).default("site-images"),
  path: z.string().trim().min(1).max(512),
  alt: z.string().trim().max(300).default(""),
});

/**
 * Saving an empty string deletes the row — that is the whole "reset to
 * default" mechanism: with no row, the code fallback shows again.
 */
export const saveText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    slotKey
      .extend({
        locale: z.enum(["lt", "en"]).default("lt"),
        value: z.string().max(20000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { page, slot, locale, value } = data;

    if (!value.trim()) {
      const { error } = await context.supabase
        .from("page_text")
        .delete()
        .match({ page, slot, locale });
      if (error) throw new Error(error.message);
      return { ok: true, cleared: true };
    }

    const { error } = await context.supabase
      .from("page_text")
      .upsert({ page, slot, locale, value }, { onConflict: "page,slot,locale" });
    if (error) throw new Error(error.message);
    return { ok: true, cleared: false };
  });

export const saveMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => mediaInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("page_media")
      .upsert(data, { onConflict: "page,slot" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Clears the owner's choice; the developer default (or nothing) takes over. */
export const clearMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => slotKey.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("page_media").delete().match(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Developer only: pins the current image as the fallback everyone falls back to. */
export const pinDefault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => mediaInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context);
    const { error } = await context.supabase
      .from("page_media_defaults")
      .upsert(data, { onConflict: "page,slot" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unpinDefault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => slotKey.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context);
    const { error } = await context.supabase.from("page_media_defaults").delete().match(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
