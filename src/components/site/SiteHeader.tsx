import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { LocaleLink } from "@/components/site/LocaleLink";
import { LumaLogo } from "@/components/site/LumaLogo";
import { useLocale } from "@/content";
import { localizePath } from "@/lib/locale";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = useLocale();
  const home = localizePath("/", locale);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { label: "Pradžia", to: "/" as const, hash: undefined },
    { label: "Paslaugos", to: "/paslaugos" as const, hash: undefined },
    { label: "Straipsniai", to: "/straipsniai" as const, hash: undefined },
    { label: "Apie mane", to: "/apie" as const, hash: undefined },
    { label: "Kontaktai", to: "/kontaktai" as const, hash: undefined },
  ];

  return (
    <header className="site-header">
      <div className="wrap nav-row">
        <LocaleLink to="/" className="logo" aria-label="Lumidenta">
          <LumaLogo />
        </LocaleLink>

        <nav className="primary" aria-label="Pagrindinė navigacija">
          {links.map((link) => (
            <LocaleLink
              key={link.label}
              to={link.to}
              hash={link.hash}
              className={pathname === home && link.to === "/" && !link.hash ? "active" : undefined}
            >
              {link.label}
            </LocaleLink>
          ))}
        </nav>

        <LocaleLink to="/kontaktai" className="btn">
          Registruotis vizitui →
        </LocaleLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Uždaryti" : "Meniu"}
        </button>
      </div>

      <div className={`wrap mobile-nav${open ? " open" : ""}`}>
        {links.map((link) => (
          <LocaleLink key={link.label} to={link.to} hash={link.hash} onClick={() => setOpen(false)}>
            {link.label}
          </LocaleLink>
        ))}
        <LocaleLink to="/kontaktai" className="btn" onClick={() => setOpen(false)}>
          Registruotis vizitui →
        </LocaleLink>
      </div>
    </header>
  );
}
