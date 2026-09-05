import { createServerFn } from "@tanstack/react-start";

/**
 * Public, unauthenticated read of the list-shaped content: services,
 * testimonials and the singleton site settings. Fetched in route loaders so
 * the rows land in the server-rendered HTML.
 */

export type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  icon: string;
  tone: string;
  imageUrl: string | null;
  includes: string[];
  sortOrder: number;
  showOnHome: boolean;
};

export type TestimonialRow = {
  id: string;
  quote: string;
  authorName: string;
  authorDetail: string | null;
  sortOrder: number;
};

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  imageUrl: string | null;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  showOnHome: boolean;
};


export type SiteSettings = {
  practiceName: string;
  dentistName: string;
  phone: string;
  email: string;
  addressLine: string;
  district: string;
  oplLicence: string;
  aspiLicence: string;
  facebookUrl: string;
  mapUrl: string;
};

export type CatalogPayload = {
  services: ServiceRow[];
  testimonials: TestimonialRow[];
  posts: PostRow[];
  settings: SiteSettings;
};

export const emptySettings: SiteSettings = {
  practiceName: "Lumidenta",
  dentistName: "",
  phone: "",
  email: "",
  addressLine: "",
  district: "",
  oplLicence: "",
  aspiLicence: "",
  facebookUrl: "",
  mapUrl: "",
};

export const emptyCatalog: CatalogPayload = {
  services: [],
  testimonials: [],
  posts: [],
  settings: emptySettings,
};

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export const fetchCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogPayload> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return emptyCatalog;

    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const [servicesRes, testimonialsRes, postsRes, settingsRes] = await Promise.all([
      supabase
        .from("services")
        .select(
          "id, slug, title, excerpt, body, icon, tone, image_bucket, image_path, includes, sort_order, show_on_home",
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("testimonials")
        .select("id, quote, author_name, author_detail, sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("posts")
        .select(
          "id, slug, title, excerpt, body, author, image_bucket, image_path, image_alt, seo_title, seo_description, published_at, show_on_home",
        )
        .eq("published", true)
        .order("published_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    ]);

    const services: ServiceRow[] = (servicesRes.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      body: row.body ?? "",
      icon: row.icon ?? "",
      tone: row.tone ?? "t1",
      imageUrl: row.image_path
        ? `${url}/storage/v1/object/public/${row.image_bucket}/${row.image_path}`
        : null,
      includes: toStringList(row.includes),
      sortOrder: row.sort_order ?? 0,
      showOnHome: Boolean(row.show_on_home),
    }));

    const testimonials: TestimonialRow[] = (testimonialsRes.data ?? []).map((row) => ({
      id: row.id,
      quote: row.quote,
      authorName: row.author_name,
      authorDetail: row.author_detail ?? null,
      sortOrder: row.sort_order ?? 0,
    }));

    const posts: PostRow[] = (postsRes.data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      body: row.body ?? "",
      author: row.author ?? "",
      imageUrl: row.image_path
        ? `${url}/storage/v1/object/public/${row.image_bucket}/${row.image_path}`
        : null,
      imageAlt: row.image_alt ?? "",
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
      publishedAt: row.published_at,
      showOnHome: Boolean(row.show_on_home),
    }));

    const s = settingsRes.data as Record<string, string> | null;
    const settings: SiteSettings = s
      ? {
          practiceName: s['practice_name'] || "Lumidenta",
          dentistName: s['dentist_name'] || "",
          phone: s['phone'] || "",
          email: s['email'] || "",
          addressLine: s['address_line'] || "",
          district: s['district'] || "",
          oplLicence: s['opl_licence'] || "",
          aspiLicence: s['aspi_licence'] || "",
          facebookUrl: s['facebook_url'] || "",
          mapUrl: s['map_url'] || "",
        }
      : emptySettings;

    return { services, testimonials, posts, settings };
  },
);
