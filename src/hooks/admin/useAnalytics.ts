import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type AnalyticsRange = 7 | 30 | 90;

export interface AnalyticsSummary {
  totals: { views: number; visitors: number };
  previous: { views: number; visitors: number };
  avg_duration_ms: number;
  bounce_rate: number;
  pages_per_visit: number;
  daily: { day: string; views: number; visitors: number }[];
  top_pages: { path: string; views: number }[];
  countries: { code: string; views: number; visitors: number }[];
  sources: { source: string; views: number }[];
  devices: { device: string; views: number }[];
  leads: number;
}

const EMPTY: AnalyticsSummary = {
  totals: { views: 0, visitors: 0 },
  previous: { views: 0, visitors: 0 },
  avg_duration_ms: 0,
  bounce_rate: 0,
  pages_per_visit: 0,
  daily: [],
  top_pages: [],
  countries: [],
  sources: [],
  devices: [],
  leads: 0,
};

function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Aggregated first-party analytics. Staff-only at the database level. */
export function useAnalytics(range: AnalyticsRange, includeShort = false, enabled = true) {
  return useQuery({
    queryKey: ["admin-analytics", range, includeShort],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data, error } = await (supabase.rpc as any)("analytics_summary", {
        _from: isoDay(range - 1),
        _to: isoDay(0),
        _include_short: includeShort,
      });
      if (error) throw error;
      return { ...EMPTY, ...((data as AnalyticsSummary | null) ?? {}) };
    },
  });
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** "1 min. 20 s" / "42 s" */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total} s`;
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return sec ? `${min} min. ${sec} s` : `${min} min.`;
}

const REGION = new Intl.DisplayNames(["lt"], { type: "region" });

export function countryLabel(code: string): string {
  if (!code || code === "XX") return "Nežinoma";
  try {
    return REGION.of(code) ?? code;
  } catch {
    return code;
  }
}

/** ISO country code → emoji flag. */
export function countryFlag(code: string): string {
  if (!code || code === "XX" || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
