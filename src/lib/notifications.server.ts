import { resolveFromAddress } from "@/lib/email-from";

/**
 * Minimal transactional e-mail sender (Resend through the Lovable connector
 * gateway). Used by account invites and password recovery.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; detail?: string }> {
  const apiKey = process.env["RESEND_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey || !lovableKey) {
    console.warn("[sendEmail] missing e-mail credentials");
    return { ok: false, detail: "missing-credentials" };
  }

  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: resolveFromAddress(), to: [to], subject, html }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("[sendEmail]", res.status, text.slice(0, 500));
    return { ok: false, detail: text.slice(0, 500) };
  }
  return { ok: true };
}
