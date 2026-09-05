import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaff } from "./users.server";

/** Everything here is staff-only (developer, owner or editor). */

const idInput = z.object({ id: z.string().uuid() });

/* ------------------------------------------------------------------ admin reads */

export const listAllServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ------------------------------------------------------------------ services */

const serviceFields = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Adresas gali turėti tik mažąsias raides, skaičius ir brūkšnelius."),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(600).default(""),
  body: z.string().max(20000).default(""),
  icon: z.string().trim().max(8).default(""),
  tone: z.enum(["t1", "t2", "t3", "t4"]).default("t1"),
  includes: z.array(z.string().trim().max(300)).max(20).default([]),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
  show_on_home: z.boolean().default(false),
});

export const saveService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => serviceFields.extend({ id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("services").update(fields).eq("id", id)
      : context.supabase.from("services").insert(fields);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ testimonials */

const testimonialFields = z.object({
  quote: z.string().trim().min(1).max(2000),
  author_name: z.string().trim().min(1).max(120),
  author_detail: z.string().trim().max(200).nullable().default(null),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const saveTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => testimonialFields.extend({ id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("testimonials").update(fields).eq("id", id)
      : context.supabase.from("testimonials").insert(fields);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ site settings */

const settingsFields = z.object({
  practice_name: z.string().trim().max(200).default(""),
  dentist_name: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(60).default(""),
  email: z.string().trim().max(200).default(""),
  address_line: z.string().trim().max(300).default(""),
  district: z.string().trim().max(200).default(""),
  opl_licence: z.string().trim().max(60).default(""),
  aspi_licence: z.string().trim().max(120).default(""),
  facebook_url: z.string().trim().max(400).default(""),
  map_url: z.string().trim().max(600).default(""),
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => settingsFields.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ singleton: true, ...data }, { onConflict: "singleton" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------ posts */

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const postFields = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Adresas gali turėti tik mažąsias raides, skaičius ir brūkšnelius."),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(600).default(""),
  body: z.string().max(60000).default(""),
  author: z.string().trim().max(160).default(""),
  image_path: z.string().trim().max(400).nullable().default(null),
  image_alt: z.string().trim().max(300).default(""),
  seo_title: z.string().trim().max(200).default(""),
  seo_description: z.string().trim().max(300).default(""),
  published: z.boolean().default(false),
  show_on_home: z.boolean().default(true),
  published_at: z.string().min(4).max(40),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => postFields.extend({ id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("posts").update(fields).eq("id", id)
      : context.supabase.from("posts").insert(fields);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
