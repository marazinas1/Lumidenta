import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  Newspaper,
  LogOut,
  Menu,
  Phone,
  Quote,
  Settings,

  Stethoscope,
  Users,
} from "lucide-react";
import { getMyRole } from "@/lib/roles.functions";
import { ROLE_LABEL } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
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
  const { data: unread = 0 } = useUnreadInquiryCount();

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

  const groups = [
    {
      label: "Darbo sritis",
      links: [
        { to: "/admin", label: "Apžvalga", icon: LayoutDashboard },
        { to: "/admin/calendar", label: "Kalendorius", icon: CalendarDays },
        { to: "/admin/schedule", label: "Darbo laikas", icon: Clock },
        { to: "/admin/inquiries", label: "Užklausos", icon: Inbox, badge: unread },
        { to: "/admin/analytics", label: "Analitika", icon: BarChart3 },
        ...(me.isOwner ? [{ to: "/admin/users", label: "Vartotojai", icon: Users }] : []),
      ],
    },
    {
      label: "Svetainė",
      links: [
        { to: "/admin/website/home", label: "Pradžia", icon: Home },
        { to: "/admin/website/services", label: "Paslaugos", icon: Stethoscope },
        { to: "/admin/website/testimonials", label: "Atsiliepimai", icon: Quote },
        { to: "/admin/website/posts", label: "Straipsniai", icon: Newspaper },
        { to: "/admin/website/about", label: "Apie", icon: FileText },
        { to: "/admin/website/contact", label: "Kontaktai", icon: Phone },
      ],
    },
    {
      label: "Nustatymai",
      links: [{ to: "/admin/settings", label: "Nustatymai", icon: Settings }],
    },
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
        {groups.map((g) => (
          <div key={g.label} className="admin-nav-group">
            <span className="admin-nav-group-label">{g.label}</span>
            {g.links.map((l) => {
              const Icon = l.icon;
              const active = location.pathname.replace(/\/$/, "") === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "admin-nav-link active" }}
                  inactiveProps={{ className: "admin-nav-link" }}
                  onClick={() => setNavOpen(false)}
                  className={active ? "admin-nav-link active" : "admin-nav-link"}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                  {"badge" in l && l.badge ? (
                    <span className="admin-nav-badge" aria-label={`${l.badge} neperskaitytos užklausos`}>
                      {l.badge > 99 ? "99+" : l.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
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
    <div className="luma site-theme admin-shell">
      <aside className="admin-sidebar">{navContent}</aside>

      <header className="admin-mobile-bar">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Meniu" className="relative rounded-md p-2">
              <Menu className="h-5 w-5" />
              {unread > 0 ? (
                <span className="admin-mobile-dot">{unread > 99 ? "99+" : unread}</span>
              ) : null}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="luma site-theme admin-drawer flex w-72 flex-col p-0">
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
