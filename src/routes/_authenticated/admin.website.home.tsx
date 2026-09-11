import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/website/home")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings/pages/home" });
  },
});
