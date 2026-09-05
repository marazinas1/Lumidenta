import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";

import type { Locale } from "@/lib/locale";
import {
  emptyPageContent,
  fetchPageContent,
  type MediaSlot,
  type PageContentPayload,
} from "@/lib/page-content.functions";

export const PAGE_CONTENT_KEY = ["page-content"] as const;

export const pageContentQuery = queryOptions({
  queryKey: PAGE_CONTENT_KEY,
  queryFn: () => fetchPageContent(),
  staleTime: 60_000,
});

/**
 * Three-layer resolution, the whole point of the CMS:
 *
 *   text   → owner's value (this locale) → owner's value (lt) → code fallback
 *   image  → owner's choice → developer default → null (component hides the slot)
 *
 * "Reset to default" therefore costs nothing: delete the row and the layer
 * underneath shows again. No versioning, no undo log.
 */
export function resolveCopy(
  content: PageContentPayload,
  page: string,
  slot: string,
  locale: Locale,
  fallback: string,
) {
  return content.text[`${page}:${slot}:${locale}`] ?? content.text[`${page}:${slot}:lt`] ?? fallback;
}

export function resolveImage(
  content: PageContentPayload,
  page: string,
  slot: string,
): MediaSlot | null {
  return content.media[`${page}:${slot}`] ?? content.defaults[`${page}:${slot}`] ?? null;
}

/** Reads the cache primed by the route loader — no request after hydration. */
export function usePageContent(page: string, locale: Locale) {
  const { data } = useQuery(pageContentQuery);
  const content = data ?? emptyPageContent;

  return {
    content,
    copy: (slot: string, fallback: string) => resolveCopy(content, page, slot, locale, fallback),
    image: (slot: string) => resolveImage(content, page, slot),
  };
}

/** Route-loader helper: warms the cache on the server so the copy is in the HTML. */
export function ensurePageContent(context: { queryClient: QueryClient }) {
  return context.queryClient.ensureQueryData(pageContentQuery);
}
