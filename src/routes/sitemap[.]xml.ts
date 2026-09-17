import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { SITE_URL } from "@/data/nav";
const STATIC_PATHS = ["/", "/paslaugos", "/kainos", "/apie", "/kontaktai", "/registracija", "/straipsniai", "/taisykles", "/privatumo-politika"];

function urlEntry(path: string): string {
  return [`  <url>`, `    <loc>${SITE_URL}${path}</loc>`, `  </url>`].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const paths = [...STATIC_PATHS];
        if (url && key) {
          const { createClient } = await import("@supabase/supabase-js");
          const client = createClient(url, key, { auth: { persistSession: false } });
          const [services, posts] = await Promise.all([
            client.from("services").select("slug").eq("published", true),
            client.from("posts").select("slug").eq("published", true),
          ]);
          if (services.error) throw services.error;
          if (posts.error) throw posts.error;
          paths.push(...(services.data ?? []).map(({ slug }) => `/paslaugos/${slug}`));
          paths.push(...(posts.data ?? []).map(({ slug }) => `/straipsniai/${slug}`));
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map(urlEntry),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
