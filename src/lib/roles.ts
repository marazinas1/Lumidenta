/**
 * Role hierarchy for the Lumidenta admin panel.
 *
 * developer > owner > editor
 * - developer: the platform developer (highest, cannot be changed or removed)
 * - owner: the practice owner, manages everything except developers
 * - editor: content only, no user management, no deletions
 *
 * `admin` is a legacy value from the original template and is treated as owner.
 */
export type AdminRole = "developer" | "owner" | "editor";

/** Roles that can be assigned through the admin panel. */
export const MANAGED_ROLES: AdminRole[] = ["owner", "editor"];

export const ROLE_RANK: Record<AdminRole, number> = {
  developer: 3,
  owner: 2,
  editor: 1,
};

export const ROLE_LABEL: Record<AdminRole, string> = {
  developer: "Developer",
  owner: "Savininkas",
  editor: "Redaktorius",
};

/** The only account allowed to hold the developer role. */
export const DEVELOPER_EMAIL = "rutkusmarius@gmail.com";

/** Picks the highest role out of raw database values (legacy `admin` = owner). */
export function highestRole(roles: string[]): AdminRole | null {
  const normalized = roles.map((r) => (r === "admin" ? "owner" : r)) as AdminRole[];
  const known = normalized.filter((r) => r in ROLE_RANK);
  if (known.length === 0) return null;
  return known.sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0] ?? null;
}

export function isOwnerRole(role: AdminRole | null | undefined) {
  return role === "developer" || role === "owner";
}
