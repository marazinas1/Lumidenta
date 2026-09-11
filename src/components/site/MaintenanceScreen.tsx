import { useQuery } from "@tanstack/react-query";

import { LumaLogo } from "@/components/site/LumaLogo";
import { catalogQuery } from "@/lib/catalog";

const DEFAULT_MESSAGE =
  "Svetainė šiuo metu atnaujinama. Netrukus grįšime — kol kas susisiekite telefonu arba el. paštu.";

/**
 * Shown to visitors while the owner has switched maintenance mode on in
 * Admin → Nustatymai. Signed-in staff keep seeing the real site.
 */
export function MaintenanceScreen({ onExitPreview }: { onExitPreview?: () => void }) {
  const { data } = useQuery(catalogQuery);
  const s = data?.settings;
  const message = s?.maintenanceMessage?.trim() || DEFAULT_MESSAGE;

  return (
    <div className="luma site-theme flex min-h-screen items-center justify-center px-6 py-16">
      {onExitPreview ? (
        <div className="maintenance-banner" role="status">
          <span className="maintenance-banner-text">
            Peržiūra: taip svetainę mato lankytojai.
          </span>
          <span className="maintenance-banner-actions">
            <button type="button" className="maintenance-banner-btn" onClick={onExitPreview}>
              Grįžti į svetainę
            </button>
          </span>
        </div>
      ) : null}
      <div className="w-full max-w-xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 text-xl font-extrabold">
          <LumaLogo />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Svetainė laikinai atnaujinama
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-base text-muted-foreground">{message}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          {s?.phone ? (
            <a
              className="rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground"
              href={`tel:${s.phone.replace(/\s+/g, "")}`}
            >
              {s.phone}
            </a>
          ) : null}
          {s?.email ? (
            <a
              className="rounded-full border border-border px-5 py-2.5 font-medium"
              href={`mailto:${s.email}`}
            >
              {s.email}
            </a>
          ) : null}
        </div>

        {s?.addressLine ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {s.addressLine}
            {s.district ? `, ${s.district}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
