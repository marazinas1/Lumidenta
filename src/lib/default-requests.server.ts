// Server-only: tells the developer that the owner asked for wording to become
// the default. Sending is best effort — the request is stored either way.
import { sendEmail } from "./notifications.server";
import { appLink } from "./app-url.server";

type Payload = {
  page: string;
  slot: string;
  locale: string;
  value: string;
  requesterEmail: string | null;
};

export async function notifyDevelopersOfDefaultRequest(payload: Payload): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "developer");

    const ids = (roles ?? []).map((row: { user_id: string }) => row.user_id);
    if (ids.length === 0) return;

    const emails: string[] = [];
    for (const id of ids) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data?.user?.email) emails.push(data.user.email);
    }
    if (emails.length === 0) return;

    const who = payload.requesterEmail ?? "Svetainės savininkė";
    const where = `${payload.page} → ${payload.slot} (${payload.locale.toUpperCase()})`;
    const link = appLink("/admin");
    const text = [
      `${who} prašo šį tekstą padaryti numatytuoju.`,
      "",
      `Vieta: ${where}`,
      "",
      payload.value,
      "",
      `Patvirtinti arba atmesti: ${link}`,
    ].join("\n");

    const html = text
      .split("\n")
      .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br />"))
      .join("");

    await Promise.all(
      emails.map((to, index) =>
        sendEmail({
          to,
          subject: "Naujas prašymas dėl numatytojo teksto",
          html,
          text,
          idempotencyKey: `default-request-${payload.page}-${payload.slot}-${payload.locale}-${Date.now()}-${index}`,
        }),
      ),
    );
  } catch (error) {
    console.error("[default-requests] notify failed", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
