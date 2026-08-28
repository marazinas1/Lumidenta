import { getContent, useContent } from "@/content";
import type { Locale } from "@/lib/locale";
import { pageHead } from "@/lib/seo";

export function homeRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    head: () => ({
      ...pageHead({
        path: "/",
        title: c.home.seoTitle,
        description: c.home.seoDescription,
        locale,
      }),
    }),
    component: Index,
  };
}

function Index() {
  const c = useContent();
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-medium text-ink">
        {c.home.placeholder.title}
      </h1>
      <p className="mt-4 text-base text-stone">{c.home.placeholder.text}</p>
    </section>
  );
}
