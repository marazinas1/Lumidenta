import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Eye, Inbox, Mail, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/admin/useAnalytics";
import { useRecentInquiries, useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
import { useBrandedTitle } from "@/hooks/useBrandedTitle";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "ką tik";
  if (minutes < 60) return `prieš ${minutes} min.`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `prieš ${hours} val.`;
  const days = Math.round(hours / 24);
  return `prieš ${days} d.`;
}

function Stat({ value, label, to }: { value: number; label: string; to: string }) {
  return (
    <Link to={to} className="group block">
      <span className="block text-4xl font-semibold tabular-nums transition-opacity group-hover:opacity-60">
        {value}
      </span>
      <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
    </Link>
  );
}

function AdminDashboard() {
  useBrandedTitle("Apžvalga");
  const { data: unread = 0 } = useUnreadInquiryCount();
  const { data: recent = [] } = useRecentInquiries(5);
  const { data: traffic } = useAnalytics(7);

  return (
    <div className="max-w-4xl space-y-12">
      <header>
        <h1 className="text-2xl font-semibold">Apžvalga</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kas laukia dėmesio ir kaip svetainė lankoma per pastarąsias 7 dienas.
        </p>
      </header>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Laukia dėmesio
        </h2>
        <div className="mt-4">
          {unread > 0 ? (
            <div className="rounded-xl border bg-card px-6">
              <Link
                to="/admin/inquiries"
                className="group flex items-center justify-between gap-4 py-4"
              >
                <span className="text-sm">
                  {unread} neperskaityta {unread === 1 ? "užklausa" : "užklausos"}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nieko nelaukia — visos užklausos perskaitytos.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Lankomumas (7 d.)
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <Stat
            value={Number(traffic?.totals?.views ?? 0)}
            label="Peržiūros"
            to="/admin/analytics"
          />
          <Stat
            value={Number(traffic?.totals?.visitors ?? 0)}
            label="Lankytojai"
            to="/admin/analytics"
          />
          <Stat value={Number(traffic?.leads ?? 0)} label="Užklausos" to="/admin/inquiries" />
          <Stat value={unread} label="Neperskaitytos" to="/admin/inquiries" />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Naujausios užklausos
        </h2>
        <div className="mt-4 rounded-xl border bg-card px-6">
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Užklausų kol kas nėra.</p>
          ) : (
            recent.map((item) => (
              <Link
                key={item.id}
                to="/admin/inquiries"
                className="group flex items-center gap-4 border-b py-4 last:border-b-0"
              >
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm underline-offset-4 group-hover:underline">
                  {item.name}
                </span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  {item.email}
                </span>
                <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                  {relativeTime(item.created_at)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Greiti veiksmai
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/inquiries">
              <Inbox className="mr-2 h-4 w-4" />
              Užklausos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/analytics">
              <Eye className="mr-2 h-4 w-4" />
              Analitika
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Vartotojai
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Nustatymai
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Peržiūrėti svetainę
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
