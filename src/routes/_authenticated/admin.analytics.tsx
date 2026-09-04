import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: () => <AdminPlaceholder title="Analitika" />,
});
