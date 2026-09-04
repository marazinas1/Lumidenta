import { LocaleLink } from "@/components/site/LocaleLink";
import { LumaLogo } from "@/components/site/LumaLogo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-row">
          <LocaleLink to="/" className="logo" aria-label="Lumidenta">
            <LumaLogo />
          </LocaleLink>
          <nav className="foot-links" aria-label="Poraštė">
            <LocaleLink to="/" hash="paslaugos">
              Paslaugos
            </LocaleLink>
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
