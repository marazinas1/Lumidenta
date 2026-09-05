import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";

import { emptyCatalog, fetchCatalog } from "@/lib/catalog.functions";

export const CATALOG_KEY = ["catalog"] as const;

export const catalogQuery = queryOptions({
  queryKey: CATALOG_KEY,
  // Never reject: a rejected loader promise aborts the SSR stream, which leaves
  // the client without dehydrated router data and blanks the page.
  queryFn: async () => {
    try {
      return await fetchCatalog();
    } catch (error) {
      console.error("[catalog] fetch failed", error);
      return emptyCatalog;
    }
  },
  staleTime: 60_000,
  retry: false,
});

/** Reads the cache primed by the route loader — no request after hydration. */
export function useCatalog() {
  const { data } = useQuery(catalogQuery);
  return data ?? emptyCatalog;
}

/** Route-loader helper: warms the cache on the server. */
export function ensureCatalog(context: { queryClient: QueryClient }) {
  return context.queryClient.ensureQueryData(catalogQuery).catch(() => emptyCatalog);
}
