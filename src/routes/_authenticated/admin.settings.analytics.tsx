import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/settings/analytics")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/analytics" });
  },
});
