import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeInput } from "@/components/TimeInput";
import {
  deleteScheduleException,
  listScheduleExceptions,
  listWorkingHours,
  saveScheduleException,
  saveWorkingHours,
} from "@/lib/schedule-admin.functions";
import {
  hhmmToMin,
  minToHHMM,
  WEEKDAYS,
  type ScheduleException,
  type WorkingHour,
} from "@/lib/schedule";

export const Route = createFileRoute("/_authenticated/admin/schedule")({
  component: SchedulePage,
});

type Slot = { start: string; end: string };
type Pattern = Record<number, Slot[]>;

const emptyPattern = (): Pattern => ({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });

function SchedulePage() {
  const { canEdit } = useCanEdit();
  const queryClient = useQueryClient();

  const fetchHours = useServerFn(listWorkingHours);
  const fetchExceptions = useServerFn(listScheduleExceptions);
  const saveHours = useServerFn(saveWorkingHours);
  const saveException = useServerFn(saveScheduleException);
  const removeException = useServerFn(deleteScheduleException);

  const hoursQuery = useQuery({
    queryKey: ["admin-working-hours"],
    queryFn: () => fetchHours({}) as Promise<WorkingHour[]>,
  });
  const exceptionsQuery = useQuery({
    queryKey: ["admin-schedule-exceptions"],
    queryFn: () => fetchExceptions({}) as Promise<ScheduleException[]>,
  });

  const [pattern, setPattern] = useState<Pattern>(emptyPattern);

  useEffect(() => {
    if (!hoursQuery.data) return;
    const next = emptyPattern();
    for (const row of hoursQuery.data) {
      (next[row.weekday] ??= []).push({
        start: minToHHMM(row.start_min),
        end: minToHHMM(row.end_min),
      });
    }
    setPattern(next);
  }, [hoursQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const rows = Object.entries(pattern).flatMap(([weekday, slots]) =>
        slots.map((slot) => ({
          weekday: Number(weekday),
          start_min: hhmmToMin(slot.start),
          end_min: hhmmToMin(slot.end),
        })),
      );
      return saveHours({ data: { rows } });
    },
    onSuccess: () => {
      toast.success("Darbo laikas išsaugotas.");
      void queryClient.invalidateQueries({ queryKey: ["admin-working-hours"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const [exception, setException] = useState<{
    day: string;
    kind: "closed" | "open";
    start: string;
    end: string;
    note: string;
  }>({ day: "", kind: "closed", start: "", end: "", note: "" });

  const exceptionMutation = useMutation({
    mutationFn: () =>
      saveException({
        data: {
          day: exception.day,
          kind: exception.kind,
          start_min: exception.start ? hhmmToMin(exception.start) : null,
          end_min: exception.end ? hhmmToMin(exception.end) : null,
          note: exception.note,
        },
      }),
    onSuccess: () => {
      toast.success("Išimtis įrašyta.");
      setException({ day: "", kind: "closed", start: "", end: "", note: "" });
      void queryClient.invalidateQueries({ queryKey: ["admin-schedule-exceptions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => removeException({ data: { id } }),
    onSuccess: () => {
      toast.success("Išimtis pašalinta.");
      void queryClient.invalidateQueries({ queryKey: ["admin-schedule-exceptions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setSlot = (weekday: number, index: number, patch: Partial<Slot>) => {
    setPattern((prev) => {
      const slots = [...(prev[weekday] ?? [])];
      slots[index] = { ...(slots[index] as Slot), ...patch };
      return { ...prev, [weekday]: slots };
    });
  };

  return (
    <fieldset disabled={!canEdit} className="block space-y-10">
      <ReadOnlyNotice canEdit={canEdit} />

      <div>
        <h1 className="text-2xl font-semibold">Darbo laikas</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Savaitinis grafikas: kiekvienai dienai galima nurodyti vieną ar kelis darbo intervalus.
          Dienos be intervalų svetainėje rodomos kaip nedarbo dienos.
        </p>
      </div>

      <div className="space-y-3">
        {WEEKDAYS.map((label, i) => {
          const weekday = i + 1;
          const slots = pattern[weekday] ?? [];
          return (
            <div
              key={weekday}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-4"
            >
              <span className="w-32 text-sm font-medium">{label}</span>
              {slots.length === 0 ? (
                <span className="text-sm text-muted-foreground">Nedirbama</span>
              ) : null}
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TimeInput
                    className="w-24"
                    value={slot.start}
                    onChange={(v) => setSlot(weekday, index, { start: v })}
                  />
                  <span className="text-muted-foreground">–</span>
                  <TimeInput
                    className="w-24"
                    value={slot.end}
                    onChange={(v) => setSlot(weekday, index, { end: v })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPattern((prev) => ({
                        ...prev,
                        [weekday]: (prev[weekday] ?? []).filter((_, x) => x !== index),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPattern((prev) => ({
                    ...prev,
                    [weekday]: [...(prev[weekday] ?? []), { start: "09:00", end: "17:00" }],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Intervalas
              </Button>
            </div>
          );
        })}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saugoma…" : "Išsaugoti darbo laiką"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Išimtys</h2>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Atostogos, šventės ar vienkartinis papildomas darbo laikas. Uždarant visą dieną laikų
            nurodyti nereikia.
          </p>
        </div>

        <div className="grid gap-3 rounded-xl border border-border/70 p-4 md:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={exception.day}
              onChange={(e) => setException({ ...exception, day: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tipas</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={exception.kind}
              onChange={(e) =>
                setException({ ...exception, kind: e.target.value as "closed" | "open" })
              }
            >
              <option value="closed">Nedirbama</option>
              <option value="open">Papildomas darbo laikas</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Nuo</Label>
            <TimeInput
              value={exception.start}
              onChange={(v) => setException({ ...exception, start: v })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Iki</Label>
            <TimeInput
              value={exception.end}
              onChange={(v) => setException({ ...exception, end: v })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Pastaba</Label>
            <Input
              value={exception.note}
              onChange={(e) => setException({ ...exception, note: e.target.value })}
              placeholder="Atostogos"
            />
          </div>
          <div className="md:col-span-5">
            <Button
              onClick={() => exceptionMutation.mutate()}
              disabled={!exception.day || exceptionMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Pridėti išimtį
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {(exceptionsQuery.data ?? []).map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm"
            >
              <span className="font-medium">{row.day}</span>
              <span className="text-muted-foreground">
                {row.kind === "closed" ? "Nedirbama" : "Papildomas laikas"}
                {row.start_min !== null && row.end_min !== null
                  ? ` ${minToHHMM(row.start_min)}–${minToHHMM(row.end_min)}`
                  : ""}
              </span>
              {row.note ? <span className="text-muted-foreground">· {row.note}</span> : null}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => deleteExceptionMutation.mutate(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
