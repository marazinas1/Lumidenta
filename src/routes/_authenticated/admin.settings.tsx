import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => <AdminPlaceholder title="Nustatymai" />,
});
