import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const PENDING_APPOINTMENTS_KEY = ["admin", "appointments", "pending-count"] as const;

/** Web requests still waiting for the dentist's answer — shown as a nav badge. */
export function usePendingAppointmentCount(enabled = true) {
  return useQuery({
    queryKey: PENDING_APPOINTMENTS_KEY,
    enabled,
    staleTime: 30_000,
    queryFn: async (): Promise<number> => {
      const { count, error } = await (supabase as any)
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("starts_at", new Date().toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
}
