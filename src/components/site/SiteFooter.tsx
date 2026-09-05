import { Facebook } from "lucide-react";

import { LocaleLink } from "@/components/site/LocaleLink";
import { LumaLogo } from "@/components/site/LumaLogo";
import { useCatalog } from "@/lib/catalog";

/** Used until Erika sets her own link in the admin settings. */
const FACEBOOK_FALLBACK = "https://www.facebook.com/profile.php?id=61557528596416";

export function SiteFooter() {
  const { settings } = useCatalog();
  const facebookUrl = settings.facebookUrl || FACEBOOK_FALLBACK;

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
            <LocaleLink to="/" hash="paslaugos">
              Paslaugos
            </LocaleLink>
            <LocaleLink to="/straipsniai">Straipsniai</LocaleLink>
            <LocaleLink to="/apie">Apie mane</LocaleLink>
            <LocaleLink to="/kontaktai">Kontaktai</LocaleLink>
            <LocaleLink to="/privatumo-politika">Privatumo politika</LocaleLink>
          </nav>
        </div>
        <div className="foot-copy">
          <span>© Lumidenta · gyd. odontologė Erika · Braškių g. 2B-1, Vilnius</span>
          <a href="/admin" className="foot-admin">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
