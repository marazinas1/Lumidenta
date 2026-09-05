import { Outlet } from "@tanstack/react-router";

/** Pathless shell for /straipsniai and /straipsniai/$slug. */
export function straipsniaiLayoutRoute() {
  return { component: () => <Outlet /> };
}
