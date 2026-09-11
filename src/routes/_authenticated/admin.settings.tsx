import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMyRole } from "@/lib/roles.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const { location } = useRouterState();
  const path = location.pathname.replace(/\/$/, "");

  const tabs: { to: string; label: string }[] = [
    { to: "/admin/settings", label: "Praktika" },
    { to: "/admin/settings/appearance", label: "Išvaizda" },
    { to: "/admin/settings/pages/home", label: "Pradžios tekstai" },
    { to: "/admin/settings/pages/about", label: "Apie tekstai" },
    { to: "/admin/settings/pages/contact", label: "Kontaktų tekstai" },
    { to: "/admin/settings/maintenance", label: "Techniniai darbai" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nustatymai</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Retai keičiami dalykai: praktikos duomenys, logotipas, puslapių tekstai ir prieigos.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {tabs.map((tab) => {
          const active = path === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active
                  ? "border-primary bg-primary/10 font-semibold text-foreground"
                  : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
