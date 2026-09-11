import { createFileRoute } from "@tanstack/react-router";

import { SiteSettingsForm } from "@/components/admin/settings/SiteSettingsForm";

export const Route = createFileRoute("/_authenticated/admin/settings/maintenance")({
  component: () => <SiteSettingsForm section="maintenance" />,
});
