import { createServerFn } from "@tanstack/react-start";

/**
 * Public, unauthenticated read of every editable text and image slot.
 *
 * One call for the whole site: the payload is tiny, it is fetched in route
 * loaders so the content lands in the server-rendered HTML, and a single
 * cache entry keeps every page in sync after an edit.
 */

export type MediaSlot = { url: string; alt: string; bucket: string; path: string };

export type PageContentPayload = {
  /** `${page}:${slot}:${locale}` -> value */
  text: Record<string, string>;
  /** `${page}:${slot}` -> the owner's chosen image */
  media: Record<string, MediaSlot>;
  /** `${page}:${slot}` -> the developer's pinned default image */
  defaults: Record<string, MediaSlot>;
  /** `${page}:${slot}:${locale}` -> the developer's pinned default wording */
  textDefaults: Record<string, string>;
};

export const emptyPageContent: PageContentPayload = {
  text: {},
  media: {},
  defaults: {},
  textDefaults: {},
};

export const fetchPageContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<PageContentPayload> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return emptyPageContent;

    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const publicUrl = (bucket: string, path: string) =>
      `${url}/storage/v1/object/public/${bucket}/${path}`;

    const [textRes, mediaRes, defaultsRes, textDefaultsRes] = await Promise.all([
      supabase.from("page_text").select("page, slot, locale, value"),
      supabase.from("page_media").select("page, slot, bucket, path, alt"),
      supabase.from("page_media_defaults").select("page, slot, bucket, path, alt"),
      supabase.from("page_text_defaults").select("page, slot, locale, value"),
    ]);

    const payload: PageContentPayload = { text: {}, media: {}, defaults: {}, textDefaults: {} };

    // Developer-pinned wording first; the owner's own value overrides it below.
    for (const row of textDefaultsRes.data ?? []) {
      if (!row.value) continue;
      payload.textDefaults[`${row.page}:${row.slot}:${row.locale}`] = row.value;
      payload.text[`${row.page}:${row.slot}:${row.locale}`] = row.value;
    }

    for (const row of textRes.data ?? []) {
      if (!row.value) continue;
      payload.text[`${row.page}:${row.slot}:${row.locale}`] = row.value;
    }
    for (const row of mediaRes.data ?? []) {
      payload.media[`${row.page}:${row.slot}`] = {
        url: publicUrl(row.bucket, row.path),
        alt: row.alt ?? "",
        bucket: row.bucket,
        path: row.path,
      };
    }
    for (const row of defaultsRes.data ?? []) {
      payload.defaults[`${row.page}:${row.slot}`] = {
        url: publicUrl(row.bucket, row.path),
        alt: row.alt ?? "",
        bucket: row.bucket,
        path: row.path,
      };
    }

    return payload;
  },
);
