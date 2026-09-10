import {
  formatTime,
  isSameDay,
  monthGridDays,
  openIntervalsFor,
  WEEKDAYS_SHORT,
  ymd,
  type Appointment,
  type ScheduleException,
  type WorkingHour,
} from "@/lib/schedule";

type Props = {
  anchor: Date;
  appointments: Appointment[];
  hours: WorkingHour[];
  exceptions: ScheduleException[];
  onOpenDay: (day: Date) => void;
  onOpenAppointment: (appt: Appointment) => void;
};

const MAX_VISIBLE = 3;

/** Read-only month overview: which days are worked and what is booked. */
export function MonthGrid({
  anchor,
  appointments,
  hours,
  exceptions,
  onOpenDay,
  onOpenAppointment,
}: Props) {
  const days = monthGridDays(anchor);
  const today = new Date();

  const byDay = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const key = ymd(new Date(appt.starts_at));
    const list = byDay.get(key) ?? [];
    list.push(appt);
    byDay.set(key, list);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <div className="grid grid-cols-7 border-b border-border/70">
        {WEEKDAYS_SHORT.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-xs text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = ymd(day);
          const list = byDay.get(key) ?? [];
          const outside = day.getMonth() !== anchor.getMonth();
          const works = openIntervalsFor(day, hours, exceptions).length > 0;
          const isToday = isSameDay(day, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onOpenDay(day)}
              className={`min-h-24 border-b border-r border-border/40 p-1.5 text-left align-top last:border-r-0 ${
                outside ? "opacity-45" : ""
              } ${works ? "bg-primary/5" : ""}`}
            >
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs ${
                  isToday ? "bg-primary text-primary-foreground font-semibold" : "text-foreground"
                }`}
              >
                {day.getDate()}
              </span>
              <span className="mt-1 flex flex-col gap-0.5">
                {list.slice(0, MAX_VISIBLE).map((appt) => {
                  const muted =
                    appt.kind === "block" ||
                    appt.status === "cancelled" ||
                    appt.status === "no_show";
                  return (
                    <span
                      key={appt.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAppointment(appt);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          onOpenAppointment(appt);
                        }
                      }}
                      className={`truncate rounded px-1 py-0.5 text-[11px] leading-tight ${
                        muted
                          ? "bg-muted text-muted-foreground"
                          : appt.status === "pending"
                            ? "bg-primary/15"
                            : "bg-primary/25"
                      }`}
                    >
                      {formatTime(appt.starts_at)}
                      {appt.kind === "block"
                        ? " · Užimta"
                        : appt.patient_name
                          ? ` · ${appt.patient_name}`
                          : ""}
                    </span>
                  );
                })}
                {list.length > MAX_VISIBLE ? (
                  <span className="px-1 text-[11px] text-muted-foreground">
                    +{list.length - MAX_VISIBLE} dar
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
