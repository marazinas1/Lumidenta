import { sendEmail } from "./notifications.server";

/** E-mails around online appointment requests. Never throw at the caller. */

function formatWhen(startsAt: string): string {
  return new Intl.DateTimeFormat("lt-LT", {
    timeZone: "Europe/Vilnius",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(startsAt));
}

function wrap(title: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2421;line-height:1.6">
  <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
  ${body}
  <p style="margin-top:24px;font-size:12px;color:#7b8079">Lumidenta</p>
</div>`;
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

export async function notifyNewAppointment(input: {
  serviceTitle: string;
  startsAt: string;
  name: string;
  phone: string;
  email: string;
  note: string;
}): Promise<void> {
  const when = formatWhen(input.startsAt);

  const to = await practiceEmail();
  if (to) {
    await sendEmail({
      to,
      subject: `Nauja registracijos užklausa — ${when}`,
      html: wrap(
        "Nauja registracijos užklausa",
        `<p><strong>${when}</strong><br/>${input.serviceTitle}</p>
         <p>${input.name}<br/>${input.phone}${input.email ? `<br/>${input.email}` : ""}</p>
         ${input.note ? `<p style="white-space:pre-wrap">${input.note}</p>` : ""}
         <p>Užklausa laukia patvirtinimo valdymo skydelio kalendoriuje.</p>`,
      ),
      text: `Nauja registracijos užklausa ${when}: ${input.name}, ${input.phone}`,
      idempotencyKey: `appt-new-${input.startsAt}-${input.phone}`,
    });
  }

  if (input.email) {
    await sendEmail({
      to: input.email,
      subject: "Jūsų registracijos užklausa gauta",
      html: wrap(
        "Ačiū, užklausą gavau",
        `<p>Pageidaujamas laikas: <strong>${when}</strong><br/>${input.serviceTitle}</p>
         <p>Vizitą patvirtinsiu asmeniškai — atsakymą gausite el. paštu arba telefonu.</p>`,
      ),
      text: `Užklausa gauta: ${when}. Vizitas dar nepatvirtintas.`,
      idempotencyKey: `appt-ack-${input.startsAt}-${input.phone}`,
    });
  }
}

export async function notifyAppointmentDecision(input: {
  email: string;
  serviceTitle: string;
  startsAt: string;
  confirmed: boolean;
}): Promise<void> {
  if (!input.email) return;
  const when = formatWhen(input.startsAt);
  await sendEmail({
    to: input.email,
    subject: input.confirmed ? `Vizitas patvirtintas — ${when}` : "Dėl Jūsų registracijos užklausos",
    html: input.confirmed
      ? wrap(
          "Vizitas patvirtintas",
          `<p><strong>${when}</strong><br/>${input.serviceTitle}</p>
           <p>Iki susitikimo. Jei planai keistųsi, praneškite iš anksto.</p>`,
        )
      : wrap(
          "Šio laiko rezervuoti nepavyko",
          `<p>Deja, laikas <strong>${when}</strong> netinka.</p>
           <p>Susisiekite telefonu — rasime Jums tinkamą laiką.</p>`,
        ),
    text: input.confirmed ? `Vizitas patvirtintas: ${when}` : `Laikas ${when} netinka.`,
    idempotencyKey: `appt-${input.confirmed ? "ok" : "no"}-${input.startsAt}-${input.email}`,
  });
}
