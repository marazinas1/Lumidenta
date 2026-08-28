import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";

import { EmailTestSection } from "@/components/admin/settings/EmailTestSection";
import { UsersSection } from "@/components/admin/settings/UsersSection";
import { PLATFORM_NAME } from "@/lib/brand";
import { useBrandedTitle } from "@/hooks/useBrandedTitle";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: `Nustatymai | ${PLATFORM_NAME}` },
      { name: "description", content: "Sistemos nustatymai: vartotojai ir el. pašto patikra." },
      { property: "og:title", content: `Nustatymai | ${PLATFORM_NAME}` },
      { property: "og:description", content: "Sistemos nustatymai: vartotojai ir el. pašto patikra." },
    ],
  }),
});

function SettingsPage() {
  useBrandedTitle("Nustatymai");
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Nustatymai</h1>
      </div>
      <UsersSection canEdit />
      <EmailTestSection canEdit />
    </div>
  );
}
