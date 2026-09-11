import { sendEmail } from "./notifications.server";

/** E-mail sent to the practice when the public contact form is used. */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function practiceEmail(): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("email")
      .limit(1)
      .maybeSingle();
    const email = (data?.email ?? "").trim();
    return email.length > 0 ? email : null;
  } catch {
    return null;
  }
}

export async function notifyNewLead(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  const to = await practiceEmail();
  if (!to) return;

  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const phone = escapeHtml(input.phone);
  const message = escapeHtml(input.message);

  await sendEmail({
    to,
    subject: `Nauja žinutė iš svetainės — ${input.name}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2421;line-height:1.6">
  <h2 style="margin:0 0 12px;font-size:18px">Nauja žinutė iš kontaktų formos</h2>
  <p>${name}<br/><a href="mailto:${email}">${email}</a>${phone ? `<br/>${phone}` : ""}</p>
  <p style="white-space:pre-wrap">${message}</p>
  <p>Žinutė taip pat matoma valdymo skydelio skiltyje „Užklausos“.</p>
  <p style="margin-top:24px;font-size:12px;color:#7b8079">Lumidenta</p>
</div>`,
    text: `Nauja žinutė nuo ${input.name} (${input.email}${input.phone ? `, ${input.phone}` : ""}):\n\n${input.message}`,
    idempotencyKey: `lead-${input.email}-${Date.now()}`,
  });
}
