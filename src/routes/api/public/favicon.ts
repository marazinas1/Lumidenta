import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves the site icon. When the owner uploaded one in the admin panel we
 * redirect to it; otherwise the built-in "L" mark is returned inline.
 */
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#5C7A52"/>
  <text x="32" y="46" text-anchor="middle" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="40" font-weight="700" fill="#FAFAF6">L</text>
</svg>`;

export const Route = createFileRoute("/api/public/favicon")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const url = process.env["SUPABASE_URL"];
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
          if (url && key) {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
            });
            const { data } = await supabase
              .from("site_settings")
              .select("favicon_path")
              .limit(1)
              .maybeSingle();
            const path = (data as { favicon_path?: string | null } | null)?.favicon_path;
            if (path) {
              return new Response(null, {
                status: 302,
                headers: {
                  location: `${url}/storage/v1/object/public/site-images/${path}`,
                  "cache-control": "public, max-age=300",
                },
              });
            }
          }
        } catch {
          // fall through to the built-in mark
        }

        return new Response(DEFAULT_SVG, {
          headers: {
            "content-type": "image/svg+xml",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
