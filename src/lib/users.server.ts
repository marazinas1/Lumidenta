import { highestRole, type AdminRole } from "./roles";

type Ctx = { supabase: any; userId: string };

/** Reads the caller's effective role through their own session (RLS applies). */
export async function getRole(ctx: Ctx): Promise<AdminRole | null> {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return highestRole((data ?? []).map((r: { role: string }) => r.role));
}

/** Any admin-panel user (developer, owner or editor). */
export async function assertStaff(ctx: Ctx): Promise<AdminRole> {
  const role = await getRole(ctx);
  if (!role) throw new Error("Neturite prieigos prie valdymo skydelio.");
  return role;
}

/** Developer or owner only. */
export async function assertOwner(ctx: Ctx): Promise<AdminRole> {
  const role = await assertStaff(ctx);
  if (role === "editor") throw new Error("Šiam veiksmui reikia savininko teisių.");
  return role;
}
