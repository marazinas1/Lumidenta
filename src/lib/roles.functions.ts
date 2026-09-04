import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { highestRole, isOwnerRole } from "./roles";

/** Role + identity of the signed-in user, read through their own session. */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    const role = highestRole(roles);
    const claims = context.claims as { email?: string } | null;
    return {
      roles,
      role,
      email: claims?.email ?? "",
      isStaff: role !== null,
      isOwner: isOwnerRole(role),
    };
  });
