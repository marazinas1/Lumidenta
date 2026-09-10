import { useQuery } from "@tanstack/react-query";

import { catalogQuery } from "@/lib/catalog";

/**
 * Lumidenta logo. When the owner uploads a logo in Nustatymai it is used
 * everywhere; otherwise the built-in sage mark + wordmark is shown.
 */
export function LumaLogo() {
  const { data } = useQuery({ ...catalogQuery, staleTime: 60_000 });
  const logoUrl = data?.settings.logoUrl ?? null;
  const name = data?.settings.practiceName || "Lumidenta";

  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="logo-image" />;
  }

  return (
    <>
      <svg className="logo-mark" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
          fill="#5C7A52"
        />
      </svg>
      Lumidenta
    </>
  );
}
