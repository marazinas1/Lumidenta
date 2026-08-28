/** Platformos (produkto) pavadinimas. Vienintelė vieta, kur jis apibrėžiamas. */
export const PLATFORM_NAME = "Lumidenta";

/**
 * Sudaro naršyklės kortelės pavadinimą.
 * `brand` — pavadinimas iš nustatymų; jei tuščias, naudojamas platformos pavadinimas.
 */
export function pageTitle(page: string, brand?: string | null): string {
  const suffix = (brand ?? "").trim() || PLATFORM_NAME;
  return page.trim() ? `${page.trim()} | ${suffix}` : suffix;
}
