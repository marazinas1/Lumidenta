import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarDays, Check, Mail, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { useBrandedTitle } from "@/hooks/useBrandedTitle";
import { listAppointments, setAppointmentStatus } from "@/lib/schedule-admin.functions";
import { formatDayLabel, formatTime, ymd, type Appointment } from "@/lib/schedule";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  component: RequestsPage,
});

function receivedLabel(iso: string): string {
  return new Intl.DateTimeFormat("lt-LT", {
    timeZone: "Europe/Vilnius",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function RequestsPage() {
  useBrandedTitle("Vizitų užklausos");
  const { canEdit } = useCanEdit();
  const queryClient = useQueryClient();
  const fetchAppointments = useServerFn(listAppointments);
  const setStatus = useServerFn(setAppointmentStatus);

  const from = ymd(new Date());
  const to = ymd(new Date(Date.now() + 365 * 86_400_000));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin", "appointments", "requests", from],
    queryFn: () => fetchAppointments({ data: { from, to } }) as Promise<Appointment[]>,
  });

  const pending = appointments.filter((a) => a.kind !== "block" && a.status === "pending");

  const decide = useMutation({
    mutationFn: (v: { id: string; status: Appointment["status"] }) => setStatus({ data: v }),
    onSuccess: async (_r, v) => {
      toast.success(v.status === "confirmed" ? "Vizitas patvirtintas." : "Užklausa atmesta.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti."),
  });

  return (
    <div className="max-w-4xl space-y-5">
      <ReadOnlyNotice canEdit={canEdit} />

      <div>
        <h1 className="text-2xl font-semibold">Vizitų užklausos</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Registracijos, atsiųstos per svetainę ir laukiančios Jūsų sprendimo. Patvirtinus laikas
          užsirezervuoja kalendoriuje, o pacientas gauna patvirtinimo laišką.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : pending.length === 0 ? (
        <div className="rounded-xl border border-border/70 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nėra laukiančių užklausų. Visi vizitai sutvarkyti.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/admin/calendar">Atidaryti kalendorių</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((appt) => (
            <li
              key={appt.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {formatDayLabel(new Date(appt.starts_at))}, {formatTime(appt.starts_at)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appt.service_title || "Paslauga nenurodyta"}
                  </p>
                  <p className="mt-2 text-sm font-medium">{appt.patient_name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {appt.patient_phone ? (
                      <a className="inline-flex items-center gap-1.5" href={`tel:${appt.patient_phone}`}>
                        <Phone className="h-3.5 w-3.5" /> {appt.patient_phone}
                      </a>
                    ) : null}
                    {appt.patient_email ? (
                      <a
                        className="inline-flex items-center gap-1.5"
                        href={`mailto:${appt.patient_email}`}
                      >
                        <Mail className="h-3.5 w-3.5" /> {appt.patient_email}
                      </a>
                    ) : null}
                  </div>
                  {appt.note ? (
                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/60 p-2 text-sm">
                      {appt.note}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Gauta {receivedLabel(appt.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!canEdit || decide.isPending}
                    onClick={() => decide.mutate({ id: appt.id, status: "confirmed" })}
                  >
                    <Check className="mr-1.5 h-4 w-4" /> Patvirtinti
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canEdit || decide.isPending}
                    onClick={() => decide.mutate({ id: appt.id, status: "cancelled" })}
                  >
                    <X className="mr-1.5 h-4 w-4" /> Atmesti
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
