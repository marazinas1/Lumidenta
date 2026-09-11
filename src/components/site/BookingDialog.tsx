import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestAppointment } from "@/lib/booking.functions";
import { formatDayLabel, formatTime } from "@/lib/schedule";
import type { BookableService } from "@/lib/schedule.functions";

/**
 * Public appointment request form. Opens on a chosen free slot; the request is
 * created as "waiting for confirmation" — never as a confirmed visit.
 */
export function BookingDialog({
  slot,
  service,
  onClose,
  onBooked,
}: {
  slot: Date | null;
  service: BookableService | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  const send = useServerFn(requestAppointment);
  const [values, setValues] = useState({ name: "", phone: "", email: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const openedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (slot) {
      openedAt.current = Date.now();
      setStatus("idle");
      setError(null);
    }
  }, [slot]);

  const field = "w-full rounded-xl border border-border bg-linen px-4 py-3 text-sm text-ink outline-none focus:border-sage";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!slot || status === "sending") return;
    setError(null);

    if (values.name.trim().length < 2) return setError("Įrašykite savo vardą.");
    if (values.phone.trim().length < 6) return setError("Įrašykite telefono numerį.");
    if (!consent) return setError("Reikia sutikimo su privatumo politika.");

    setStatus("sending");
    try {
      await send({
        data: {
          serviceId: service?.id ?? null,
          startsAt: slot.toISOString(),
          durationMin: service?.durationMin ?? 30,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          note: values.note.trim(),
          consent: true,
          company,
          elapsedMs: Date.now() - openedAt.current,
        },
      });
      setStatus("sent");
      setValues({ name: "", phone: "", email: "", note: "" });
      setConsent(false);
      onBooked();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Užklausos išsiųsti nepavyko.");
    }
  }

  return (
    <Dialog open={slot !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="luma max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === "sent" ? "Užklausa išsiųsta" : "Registracijos užklausa"}
          </DialogTitle>
        </DialogHeader>

        {slot ? (
          <p className="text-sm text-stone">
            {formatDayLabel(slot)}, {formatTime(slot)}
            {service ? ` · ${service.title} (${service.durationMin} min.)` : ""}
          </p>
        ) : null}

        {status === "sent" ? (
          <div className="space-y-4">
            <p className="text-sm text-ink">
              Ačiū. Laikas rezervuotas laikinai ir laukia patvirtinimo — susisieksiu su Jumis
              asmeniškai.
            </p>
            <p className="text-sm text-stone">
              Patvirtinimo laišką siunčiame iš noreply@notify.lumidenta.deerva.com. Jei jo
              nematote, patikrinkite „Šlamštas“ (Spam) arba „Promotions“ skiltį.
            </p>
            <button type="button" className="btn" onClick={onClose}>
              Uždaryti
            </button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={submit}>
            <label className="block space-y-2">
              <span className="label-caps text-stone">Vardas</span>
              <input
                className={field}
                value={values.name}
                autoComplete="name"
                maxLength={160}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
            </label>
            <label className="block space-y-2">
              <span className="label-caps text-stone">Telefonas</span>
              <input
                className={field}
                value={values.phone}
                type="tel"
                autoComplete="tel"
                maxLength={60}
                onChange={(e) => setValues({ ...values, phone: e.target.value })}
              />
            </label>
            <label className="block space-y-2">
              <span className="label-caps text-stone">El. paštas (nebūtina)</span>
              <input
                className={field}
                value={values.email}
                type="email"
                autoComplete="email"
                maxLength={200}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
              />
            </label>
            <label className="block space-y-2">
              <span className="label-caps text-stone">Pastaba (nebūtina)</span>
              <textarea
                className={field}
                rows={3}
                maxLength={1000}
                value={values.note}
                onChange={(e) => setValues({ ...values, note: e.target.value })}
              />
            </label>

            {/* Honeypot: hidden from people, tempting for bots. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
            />

            <label className="flex items-start gap-2 text-sm text-stone">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                Sutinku, kad mano kontaktai būtų naudojami susisiekti dėl vizito (
                <a href="/privatumo-politika" className="underline">
                  privatumo politika
                </a>
                ).
              </span>
            </label>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <button type="submit" className="btn w-full" disabled={status === "sending"}>
              {status === "sending" ? "Siunčiama…" : "Siųsti užklausą"}
            </button>
            <p className="text-xs text-stone">
              Vizitas nėra patvirtintas iškart — patvirtinsiu asmeniškai.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
