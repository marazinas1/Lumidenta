import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/settings/users")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/users" });
  },
});
