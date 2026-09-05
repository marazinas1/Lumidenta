import { Outlet } from "@tanstack/react-router";

/** Pathless shell for /paslaugos and /paslaugos/$slug. */
export function paslaugosLayoutRoute() {
  return { component: () => <Outlet /> };
}
