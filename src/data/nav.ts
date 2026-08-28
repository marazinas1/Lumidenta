import { getContent } from "@/content";
import type { Locale } from "@/lib/locale";

/** Canonical (Lithuanian) paths — locale prefixing happens in <LocaleLink>. */
export type RoutePath = string;
export type NavLink = { label: string; to: RoutePath };
export type NavEntry = NavLink | { label: string; items: NavLink[] };

const FALLBACK_SITE_URL = "https://lumidenta.lt";

/** Canonical site origin; override with VITE_SITE_URL if the domain changes. */
export const SITE_URL = (
  import.meta.env?.['VITE_SITE_URL'] || FALLBACK_SITE_URL
).replace(/\/$/, "");

export function mainNav(locale: Locale): NavEntry[] {
  const { nav } = getContent(locale).common;
  return [
    { label: nav.about, to: "/apie" },
    { label: nav.contacts, to: "/kontaktai" },
  ];
}

export function footerNav(locale: Locale): NavLink[] {
  const { nav } = getContent(locale).common;
  return [
    { label: nav.about, to: "/apie" },
    { label: nav.contacts, to: "/kontaktai" },
  ];
}
