import { useEffect } from "react";

import { pageTitle } from "@/lib/brand";

/** Sets the browser tab title on authenticated (admin) pages. */
export function useBrandedTitle(page: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = pageTitle(page);
  }, [page]);
}
