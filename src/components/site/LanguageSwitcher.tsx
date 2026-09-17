import { Link, useRouterState } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";


import { useLocale } from "@/content";
import {
  LOCALES,
  LOCALE_COOKIE,
  localizePath,
  localizeRouteId,
  type Locale,
} from "@/lib/locale";
import { cn } from "@/lib/utils";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/**
 * Lithuanian is canonical. English stays unavailable until translation is complete.
 */
export function useRememberedLocaleRedirect() {}


export function LanguageSwitcher({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const current = useLocale();
  const location = useRouterState({ select: (state) => state.location });
  // Use the matched route pattern + params so dynamic routes ($propertyId,
  // $categorySlug) resolve instead of 404-ing on a pre-resolved concrete path.
  const leaf = useRouterState({
    select: (state) => {
      const match = state.matches[state.matches.length - 1];
      return match
        ? { routeId: match.routeId as string, params: match.params as Record<string, unknown> }
        : null;
    },
  });

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)} aria-label="Language">
      {LOCALES.filter((locale) => locale === "lt").map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 ? <span className="opacity-40">/</span> : null}
          <Link
            {...({
              to: leaf
                ? localizeRouteId(leaf.routeId, locale)
                : localizePath(location.pathname, locale),
              params: leaf?.params ?? {},
              search: location.search,
              hrefLang: locale,
              "aria-current": locale === current ? "true" : undefined,
              onClick: () => rememberLocale(locale),
              className: cn(
                "uppercase tracking-wide transition-opacity",
                locale === current
                  ? tone === "light"
                    ? "text-warm-white"
                    : "text-sage"
                  : "opacity-60 hover:opacity-100",
              ),
              children: locale,
            } as unknown as LinkProps)}
          />
        </span>
      ))}
    </div>
  );
}
