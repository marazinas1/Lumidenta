import { sendLovableEmail } from "@lovable.dev/email-js";

const SENDER_DOMAIN = "notify.lumidenta.deerva.com";

/**
 * Transactional e-mail sender for account invites and password recovery.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey: string;
}): Promise<{ ok: boolean; detail?: string }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!lovableKey) {
    console.warn("[sendEmail] missing e-mail credentials");
    return { ok: false, detail: "missing-credentials" };
  }

  try {
    const result = await sendLovableEmail(
      {
        to,
        from: `Lumidenta <noreply@${SENDER_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text: text ?? subject,
        purpose: "transactional",
        idempotency_key: idempotencyKey,
      },
      { apiKey: lovableKey },
    );
    if (!result.success) {
      return { ok: false, detail: result.status ?? "email-send-failed" };
    }
    return { ok: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "email-send-failed";
    console.error("[sendEmail]", detail);
    return { ok: false, detail };
  }
}
