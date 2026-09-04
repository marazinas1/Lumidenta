import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export const Route = createFileRoute("/_authenticated/admin/website/services")({
  component: () => <AdminPlaceholder title="Paslaugos" />,
});
