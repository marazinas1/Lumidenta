import { useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { LocaleLink } from "@/components/site/LocaleLink";
import { useContent, useLocale } from "@/content";
import { mainNav, type NavEntry, type NavLink } from "@/data/nav";
import { localizePath } from "@/lib/locale";
import { cn } from "@/lib/utils";

function isGroup(entry: NavEntry): entry is { label: string; items: NavLink[] } {
  return "items" in entry;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = useLocale();
  const { common } = useContent();
  const nav = mainNav(locale).filter((entry): entry is NavLink => !isGroup(entry));
  const homePath = localizePath("/", locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const solid = scrolled || menuOpen || pathname !== homePath;
  const linkTone = solid ? "text-stone hover:text-sage" : "text-ink/80 hover:text-sage";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid ? "border-b border-border/70 bg-linen/95 backdrop-blur-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 lg:px-12">
        <LocaleLink
          to="/"
          aria-label={`${common.brand} — ${common.nav.home}`}
          className="font-display text-lg font-medium tracking-tight text-ink"
        >
          {common.brand}
        </LocaleLink>

        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {nav.map((entry) => (
              <LocaleLink
                key={entry.to}
                to={entry.to}
                activeProps={{ className: "text-sage" }}
                className={cn("text-sm font-medium transition-colors", linkTone)}
              >
                {entry.label}
              </LocaleLink>
            ))}
          </nav>

          <LanguageSwitcher className="text-sm text-stone" tone="dark" />

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="text-ink lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border/70 bg-linen px-6 pb-8 pt-2 lg:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {nav.map((entry) => (
              <LocaleLink
                key={entry.to}
                to={entry.to}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border/60 py-4 text-base font-medium text-ink"
              >
                {entry.label}
              </LocaleLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
