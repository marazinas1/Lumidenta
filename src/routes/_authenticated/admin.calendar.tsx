import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/TimeInput";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCatalog } from "@/lib/catalog";
import {
  deleteAppointment,
  listAppointments,
  listScheduleExceptions,
  listWorkingHours,
  moveAppointment,
  saveAppointment,
} from "@/lib/schedule-admin.functions";
import {
  addDays,
  dayTime,
  formatDayLabel,
  formatTime,
  minToHHMM,
  minutesOfDay,
  openIntervalsFor,
  startOfWeek,
  STATUS_LABEL,
  WEEKDAYS_SHORT,
  weekDays,
  ymd,
  type Appointment,
  type ScheduleException,
  type WorkingHour,
} from "@/lib/schedule";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  component: CalendarPage,
});

const PX_PER_MIN = 1; // 60 px per hour
const SNAP = 15;

type Draft = {
  id?: string;
  day: string;
  start: string;
  end: string;
  service_id: string | null;
  service_title: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  note: string;
  status: Appointment["status"];
  kind: Appointment["kind"];
};

type DragState = {
  id: string;
  mode: "move" | "resize";
  pointerStartY: number;
  originStart: number;
  originEnd: number;
  dayIndex: number;
  offsetStart: number;
  offsetEnd: number;
  offsetDay: number;
};

function CalendarPage() {
  const { canEdit } = useCanEdit();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { services } = useCatalog();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [mobileDay, setMobileDay] = useState(() => ymd(new Date()));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const days = weekDays(weekStart);
  const from = ymd(days[0] as Date);
  const to = ymd(days[6] as Date);

  const fetchAppointments = useServerFn(listAppointments);
  const fetchHours = useServerFn(listWorkingHours);
  const fetchExceptions = useServerFn(listScheduleExceptions);
  const save = useServerFn(saveAppointment);
  const move = useServerFn(moveAppointment);
  const remove = useServerFn(deleteAppointment);

  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments", from, to],
    queryFn: () => fetchAppointments({ data: { from, to } }) as Promise<Appointment[]>,
  });
  const hoursQuery = useQuery({
    queryKey: ["admin-working-hours"],
    queryFn: () => fetchHours({}) as Promise<WorkingHour[]>,
  });
  const exceptionsQuery = useQuery({
    queryKey: ["admin-schedule-exceptions"],
    queryFn: () => fetchExceptions({}) as Promise<ScheduleException[]>,
  });

  const appointments = appointmentsQuery.data ?? [];
  const hours = hoursQuery.data ?? [];
  const exceptions = exceptionsQuery.data ?? [];

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
  };

  const saveMutation = useMutation({
    mutationFn: (value: Draft) => {
      const starts = dayTime(value.day, hhmm(value.start));
      const ends = dayTime(value.day, hhmm(value.end));
      return save({
        data: {
          ...(value.id ? { id: value.id } : {}),
          service_id: value.service_id,
          service_title: value.service_title,
          starts_at: starts.toISOString(),
          ends_at: ends.toISOString(),
          patient_name: value.patient_name,
          patient_phone: value.patient_phone,
          patient_email: value.patient_email,
          note: value.note,
          status: value.status,
          kind: value.kind,
        },
      });
    },
    onSuccess: () => {
      toast.success("Išsaugota.");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moveMutation = useMutation({
    mutationFn: (v: { id: string; starts_at: string; ends_at: string }) => move({ data: v }),
    onSuccess: refresh,
    onError: (error: Error) => {
      toast.error(error.message);
      refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Įrašas ištrintas.");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Visible hour window: the widest of the weekly pattern and the actual visits.
  const [dayStart, dayEnd] = useMemo(() => {
    let min = 8 * 60;
    let max = 20 * 60;
    for (const h of hours) {
      min = Math.min(min, h.start_min);
      max = Math.max(max, h.end_min);
    }
    for (const a of appointments) {
      min = Math.min(min, minutesOfDay(new Date(a.starts_at)));
      max = Math.max(max, minutesOfDay(new Date(a.ends_at)) || 1440);
    }
    return [Math.max(0, Math.floor(min / 60) * 60 - 60), Math.min(1440, Math.ceil(max / 60) * 60 + 60)];
  }, [hours, appointments]);

  const totalMin = dayEnd - dayStart;
  const visibleDays = isMobile ? days.filter((d) => ymd(d) === mobileDay) : days;
  if (isMobile && visibleDays.length === 0) visibleDays.push(days[0] as Date);

  function positionOf(appt: Appointment) {
    const start = new Date(appt.starts_at);
    const end = new Date(appt.ends_at);
    let startMin = minutesOfDay(start);
    let endMin = minutesOfDay(end) || 1440;
    let dayOffset = 0;
    if (drag && drag.id === appt.id) {
      startMin += drag.offsetStart;
      endMin += drag.offsetEnd;
      dayOffset = drag.offsetDay;
    }
    return { startMin, endMin, dayOffset, startDay: ymd(start) };
  }

  function onPointerDown(e: React.PointerEvent, appt: Appointment, mode: "move" | "resize") {
    if (!canEdit) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const start = new Date(appt.starts_at);
    setDrag({
      id: appt.id,
      mode,
      pointerStartY: e.clientY,
      originStart: minutesOfDay(start),
      originEnd: minutesOfDay(new Date(appt.ends_at)) || 1440,
      dayIndex: visibleDays.findIndex((d) => ymd(d) === ymd(start)),
      offsetStart: 0,
      offsetEnd: 0,
      offsetDay: 0,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const deltaMin = Math.round((e.clientY - drag.pointerStartY) / PX_PER_MIN / SNAP) * SNAP;
    let offsetDay = 0;
    if (!isMobile && drag.mode === "move" && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const colWidth = rect.width / visibleDays.length;
      const col = Math.max(
        0,
        Math.min(visibleDays.length - 1, Math.floor((e.clientX - rect.left) / colWidth)),
      );
      offsetDay = col - drag.dayIndex;
    }
    if (drag.mode === "move") {
      setDrag({ ...drag, offsetStart: deltaMin, offsetEnd: deltaMin, offsetDay });
    } else {
      const maxShrink = drag.originStart + SNAP - drag.originEnd;
      setDrag({ ...drag, offsetStart: 0, offsetEnd: Math.max(maxShrink, deltaMin), offsetDay: 0 });
    }
  }

  function onPointerUp() {
    if (!drag) return;
    const appt = appointments.find((a) => a.id === drag.id);
    setDrag(null);
    if (!appt) return;
    if (drag.offsetStart === 0 && drag.offsetEnd === 0 && drag.offsetDay === 0) return;
    const start = new Date(appt.starts_at);
    const end = new Date(appt.ends_at);
    const newStart = new Date(start.getTime() + drag.offsetStart * 60000 + drag.offsetDay * 86400000);
    const newEnd = new Date(end.getTime() + drag.offsetEnd * 60000 + drag.offsetDay * 86400000);
    moveMutation.mutate({
      id: appt.id,
      starts_at: newStart.toISOString(),
      ends_at: newEnd.toISOString(),
    });
  }

  function newAt(day: Date, minute: number) {
    if (!canEdit) return;
    const snapped = Math.round(minute / SNAP) * SNAP;
    setDraft({
      day: ymd(day),
      start: minToHHMM(snapped),
      end: minToHHMM(Math.min(1440, snapped + 60)),
      service_id: null,
      service_title: "",
      patient_name: "",
      patient_phone: "",
      patient_email: "",
      note: "",
      status: "confirmed",
      kind: "appointment",
    });
  }

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canEdit={canEdit} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kalendorius</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Vizitai ir užblokuotas laikas. Spustelėkite tuščią vietą, kad įrašytumėte naują vizitą;
            įrašą galima tempti į kitą laiką, o už apatinio krašto — keisti trukmę.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Ši savaitė
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" disabled={!canEdit} onClick={() => newAt(days[0] as Date, 9 * 60)}>
            <Plus className="mr-2 h-4 w-4" /> Naujas vizitas
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => {
            const key = ymd(d);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMobileDay(key)}
                className={`flex min-w-14 flex-col items-center rounded-lg border px-3 py-2 text-xs ${
                  key === mobileDay ? "border-primary bg-primary/10" : "border-border/70"
                }`}
              >
                <span className="text-muted-foreground">{WEEKDAYS_SHORT[i]}</span>
                <span className="text-sm font-medium">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-xl border border-border/70">
        <div className="flex">
          <div className="w-14 shrink-0 border-r border-border/70 pt-9">
            {Array.from({ length: totalMin / 60 }, (_, i) => (
              <div
                key={i}
                className="h-[60px] pr-2 text-right text-[11px] text-muted-foreground"
                style={{ transform: "translateY(-6px)" }}
              >
                {minToHHMM(dayStart + i * 60)}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex border-b border-border/70">
              {visibleDays.map((d) => (
                <div key={ymd(d)} className="flex-1 px-2 py-2 text-center text-xs">
                  <span className="text-muted-foreground">
                    {WEEKDAYS_SHORT[(d.getDay() === 0 ? 7 : d.getDay()) - 1]}
                  </span>{" "}
                  <span className="font-medium">{d.getDate()}</span>
                </div>
              ))}
            </div>

            <div
              ref={gridRef}
              className="relative flex touch-none select-none"
              style={{ height: totalMin * PX_PER_MIN }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {visibleDays.map((day) => {
                const open = openIntervalsFor(day, hours, exceptions);
                const dayKey = ymd(day);
                return (
                  <div
                    key={dayKey}
                    className="relative min-w-0 flex-1 border-r border-border/40 last:border-r-0"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      newAt(day, dayStart + (e.clientY - rect.top) / PX_PER_MIN);
                    }}
                  >
                    {open.map((interval, i) => (
                      <div
                        key={i}
                        className="pointer-events-none absolute inset-x-0 bg-primary/5"
                        style={{
                          top: (interval.start - dayStart) * PX_PER_MIN,
                          height: (interval.end - interval.start) * PX_PER_MIN,
                        }}
                      />
                    ))}
                    {Array.from({ length: totalMin / 60 }, (_, i) => (
                      <div
                        key={i}
                        className="pointer-events-none absolute inset-x-0 border-t border-border/40"
                        style={{ top: i * 60 * PX_PER_MIN }}
                      />
                    ))}

                    {appointments
                      .filter((a) => {
                        const p = positionOf(a);
                        const shifted = ymd(addDays(new Date(a.starts_at), p.dayOffset));
                        return shifted === dayKey;
                      })
                      .map((appt) => {
                        const p = positionOf(appt);
                        const cancelled = appt.status === "cancelled" || appt.status === "no_show";
                        return (
                          <div
                            key={appt.id}
                            className={`absolute inset-x-1 overflow-hidden rounded-md border px-2 py-1 text-[11px] leading-tight shadow-sm ${
                              appt.kind === "block"
                                ? "border-border bg-muted text-muted-foreground"
                                : cancelled
                                  ? "border-border bg-background text-muted-foreground line-through"
                                  : appt.status === "pending"
                                    ? "border-primary/40 bg-primary/15"
                                    : "border-primary/60 bg-primary/25"
                            } ${canEdit ? "cursor-grab" : ""}`}
                            style={{
                              top: (p.startMin - dayStart) * PX_PER_MIN,
                              height: Math.max(22, (p.endMin - p.startMin) * PX_PER_MIN),
                            }}
                            onPointerDown={(e) => onPointerDown(e, appt, "move")}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (drag) return;
                              const start = new Date(appt.starts_at);
                              const end = new Date(appt.ends_at);
                              setDraft({
                                id: appt.id,
                                day: ymd(start),
                                start: formatTime(start),
                                end: formatTime(end),
                                service_id: appt.service_id,
                                service_title: appt.service_title,
                                patient_name: appt.patient_name,
                                patient_phone: appt.patient_phone,
                                patient_email: appt.patient_email,
                                note: appt.note,
                                status: appt.status,
                                kind: appt.kind,
                              });
                            }}
                          >
                            <div className="font-medium">
                              {formatTime(appt.starts_at)}
                              {appt.kind === "block"
                                ? " · Užimta"
                                : appt.patient_name
                                  ? ` · ${appt.patient_name}`
                                  : ""}
                            </div>
                            {appt.service_title ? <div>{appt.service_title}</div> : null}
                            {canEdit ? (
                              <div
                                className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                                onPointerDown={(e) => onPointerDown(e, appt, "resize")}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => (open ? null : setDraft(null))}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Redaguoti įrašą" : "Naujas įrašas"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {formatDayLabel(dayTime(draft.day, 0))}
              </p>

              <div className="flex gap-2">
                {(["appointment", "block"] as const).map((k) => (
                  <Button
                    key={k}
                    type="button"
                    size="sm"
                    variant={draft.kind === k ? "default" : "outline"}
                    onClick={() => setDraft({ ...draft, kind: k })}
                  >
                    {k === "appointment" ? "Vizitas" : "Užblokuotas laikas"}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={draft.day}
                    onChange={(e) => setDraft({ ...draft, day: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Pradžia</Label>
                  <TimeInput
                    value={draft.start}
                    onChange={(v) => setDraft({ ...draft, start: v })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Pabaiga</Label>
                  <TimeInput value={draft.end} onChange={(v) => setDraft({ ...draft, end: v })} />
                </div>
              </div>

              {draft.kind === "appointment" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label>Paslauga</Label>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.service_id ?? ""}
                      onChange={(e) => {
                        const service = services.find((s) => s.id === e.target.value);
                        setDraft({
                          ...draft,
                          service_id: service?.id ?? null,
                          service_title: service?.title ?? "",
                        });
                      }}
                    >
                      <option value="">— nepasirinkta —</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>Paciento vardas</Label>
                      <Input
                        value={draft.patient_name}
                        onChange={(e) => setDraft({ ...draft, patient_name: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Telefonas</Label>
                      <Input
                        value={draft.patient_phone}
                        onChange={(e) => setDraft({ ...draft, patient_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>El. paštas (nebūtina)</Label>
                    <Input
                      value={draft.patient_email}
                      onChange={(e) => setDraft({ ...draft, patient_email: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Būsena</Label>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value as Appointment["status"] })
                      }
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <Label>Pastaba</Label>
                <Textarea
                  rows={3}
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            {draft?.id ? (
              <Button
                variant="ghost"
                disabled={!canEdit}
                onClick={() => {
                  if (draft.id && confirm("Ištrinti šį įrašą?")) deleteMutation.mutate(draft.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Ištrinti
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Atšaukti
              </Button>
              <Button
                disabled={!canEdit || saveMutation.isPending}
                onClick={() => draft && saveMutation.mutate(draft)}
              >
                {saveMutation.isPending ? "Saugoma…" : "Išsaugoti"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function hhmm(value: string) {
  const [h = "0", m = "0"] = value.split(":");
  return Number(h) * 60 + Number(m);
}
