import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Globe, LayoutDashboard, LogOut, Menu, Users } from "lucide-react";
import { getMyRole } from "@/lib/roles.functions";
import { ROLE_LABEL } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { LumaLogo } from "@/components/site/LumaLogo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const fetchRole = useServerFn(getMyRole);
  const qc = useQueryClient();
  const { data: me, isLoading } = useQuery({
    queryKey: ["my-role"],
    queryFn: () => fetchRole(),
    refetchOnMount: "always",
  });
  const { location } = useRouterState();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Kraunama…</div>;
  }
  if (!me?.isStaff) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold">Prieiga negalima</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ši paskyra neturi prieigos prie valdymo skydelio.
        </p>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Apžvalga", icon: LayoutDashboard },
    ...(me.isOwner ? [{ to: "/admin/users", label: "Vartotojai", icon: Users }] : []),
  ] as const;

  async function signOut() {
    setNavOpen(false);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  const navContent = (
    <>
      <div className="admin-brand logo">
        <LumaLogo />
      </div>
      <nav className="admin-nav">
        {links.map((l) => {
          const Icon = l.icon;
          const active = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setNavOpen(false)}
              className={`admin-nav-link${active ? " active" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="admin-foot">
        <div className="admin-me">
          <span className="admin-me-email" title={me.email}>
            {me.email}
          </span>
          <span className={`admin-role-badge${me.role ? ` role-${me.role}` : ""}`}>{me.role ? ROLE_LABEL[me.role] : ""}</span>
        </div>
        <a href="/" onClick={() => setNavOpen(false)} className="admin-nav-link">
          <Globe className="h-4 w-4" />
          Atgal į svetainę
        </a>
        <button type="button" className="admin-nav-link" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Atsijungti
        </button>
      </div>
    </>
  );

  return (
    <div className="luma admin-shell">
      <aside className="admin-sidebar">{navContent}</aside>

      <header className="admin-mobile-bar">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Meniu" className="rounded-md p-2">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="admin-sidebar flex w-72 flex-col p-0">
            <SheetTitle className="sr-only">Lumidenta</SheetTitle>
            {navContent}
          </SheetContent>
        </Sheet>
        <span className="logo">
          <LumaLogo />
        </span>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
