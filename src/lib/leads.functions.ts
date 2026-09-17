import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public contact-form submission. Anyone may call this, so the payload is
 * re-validated on the server, written with admin rights, and the practice is
 * notified by e-mail (when an address is configured in the admin settings).
 */

const input = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  phone: z.union([z.string().trim().max(60), z.literal("")]).default(""),
  message: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
  source: z.string().trim().max(60).default("kontaktai"),
  // Honeypot: invisible to people, filled by simple bots.
  company: z.string().max(200).default(""),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }) => {
    if (data.company.trim() !== "") return { ok: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      source: data.source,
    });
    if (error) throw new Error("Žinutės išsiųsti nepavyko.");

    try {
      const { notifyNewLead } = await import("./leads.server");
      await notifyNewLead({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });
    } catch (notifyError) {
      console.error("[leads] notify failed", notifyError);
    }

    return { ok: true as const };
  });
