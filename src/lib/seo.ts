import { SITE_URL } from "@/data/nav";
import { localizePath, ogLocale, type Locale } from "@/lib/locale";

/**
 * Builds per-page head metadata. Every leaf route gets a unique title,
 * description, OG pair, absolute og:url, a self-referencing canonical and
 * Lithuanian canonical metadata. English remains disabled until its content is complete.
 */
export function pageHead({
  path,
  title,
  description,
  type = "website",
  locale = "lt",
  image,
}: {
  /** Canonical Lithuanian path, e.g. "/apartamentai". */
  path: string;
  title: string;
  description: string;
  type?: string;
  locale?: Locale;
  image?: string | null;
}) {
  const ltUrl = `${SITE_URL}${localizePath(path, "lt")}`;
  const url = ltUrl;
  const socialImage = image?.startsWith("https://") ? image : null;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:locale", content: ogLocale[locale] },
      { name: "twitter:card", content: socialImage ? "summary_large_image" : "summary" },
      ...(socialImage
        ? [
            { property: "og:image", content: socialImage },
            { name: "twitter:image", content: socialImage },
          ]
        : []),
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "x-default", href: ltUrl },
    ],
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
