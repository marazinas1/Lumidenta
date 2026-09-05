import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "lumidenta_sid";

function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "anon";
  }
}

/**
 * First-party page-view tracking for the public site. No cookies, no third
 * parties — one row per rendered path, grouped by a per-tab session id.
 */
export function usePageViewTracking(pathname: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      void supabase.from("page_views").insert({
        path: pathname.slice(0, 2048),
        session_id: sessionId(),
        referrer: (document.referrer || "").slice(0, 2048),
        user_agent: navigator.userAgent.slice(0, 1024),
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [pathname, enabled]);
}
