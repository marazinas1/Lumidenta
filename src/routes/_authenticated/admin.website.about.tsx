import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/website/about")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings/pages/about" });
  },
});
