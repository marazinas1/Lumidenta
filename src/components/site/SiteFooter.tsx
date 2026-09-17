import { Facebook } from "lucide-react";

import { LocaleLink } from "@/components/site/LocaleLink";
import { LumaLogo } from "@/components/site/LumaLogo";
import { useCatalog } from "@/lib/catalog";

export function SiteFooter() {
  const { settings } = useCatalog();
  const facebookUrl = settings.facebookUrl;
  const address = [settings.addressLine, settings.district].filter(Boolean).join(", ");
  const identity = [settings.practiceName || "Lumidenta", settings.dentistName, address]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-row">
          <div className="foot-brand">
            <LocaleLink to="/" className="logo" aria-label="Lumidenta">
              <LumaLogo />
            </LocaleLink>
            {facebookUrl ? (
              <a
                href={facebookUrl}
                className="foot-social"
                target="_blank"
                rel="noreferrer"
                aria-label="Lumidenta Facebook"
              >
                <Facebook size={18} strokeWidth={1.7} aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <nav className="foot-links" aria-label="Poraštė">
            <LocaleLink to="/paslaugos">Paslaugos</LocaleLink>
            <LocaleLink to="/kainos">Kainos</LocaleLink>
            <LocaleLink to="/straipsniai">Straipsniai</LocaleLink>
            <LocaleLink to="/apie">Apie mane</LocaleLink>
            <LocaleLink to="/kontaktai">Kontaktai</LocaleLink>
            <LocaleLink to="/privatumo-politika">Privatumo politika</LocaleLink>
          </nav>
        </div>
        <div className="foot-copy">
          <span>© {identity}</span>
          <span className="foot-credit">
            Svetainę sukūrė ir prižiūri{" "}
            <a href="https://www.deerva.com/?utm_source=lumidenta.lt&utm_medium=referral&utm_campaign=platform-badge" target="_blank" rel="noopener">
              Deerva
            </a>
          </span>
          <a href="/admin" className="foot-admin">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
