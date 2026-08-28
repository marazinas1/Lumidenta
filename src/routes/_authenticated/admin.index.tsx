import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
    </div>
  );
}
