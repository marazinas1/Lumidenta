import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

import { catalogQuery } from "@/lib/catalog";
import { useSignedIn } from "@/hooks/useStaffSession";

/**
 * Visible only to signed-in staff while maintenance mode is on, so nobody
 * confuses "I can see the site" with "the site is live for visitors".
 */
export function MaintenanceBanner({
  compact = false,
  onPreviewVisitor,
}: {
  compact?: boolean;
  onPreviewVisitor?: () => void;
}) {
  const { data } = useQuery(catalogQuery);
  const signedIn = useSignedIn();

  if (!data?.settings.maintenanceMode || signedIn !== true) return null;

  return (
    <div className="maintenance-banner" role="status">
      <Wrench className="h-4 w-4 shrink-0" aria-hidden />
      <span className="maintenance-banner-text">
        {compact
          ? "Techniniai darbai įjungti — lankytojai svetainės nemato."
          : "Techniniai darbai įjungti — svetainę matote tik Jūs, nes esate prisijungęs. Lankytojams rodomas atnaujinimo pranešimas."}
      </span>
      <span className="maintenance-banner-actions">
        {onPreviewVisitor ? (
          <button type="button" className="maintenance-banner-btn" onClick={onPreviewVisitor}>
            Peržiūrėti kaip lankytojas
          </button>
        ) : null}
        <Link to="/admin/settings" className="maintenance-banner-link">
          Išjungti
        </Link>
      </span>
    </div>
  );
}
