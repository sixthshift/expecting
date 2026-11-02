import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { CalendarClock, ChevronRight, MapPin } from "lucide-react";
import { useAppointmentsQuery } from "../../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../../api/rpc/questions";
import { APPOINTMENT_WHEN, appointmentSoon, nextAppointment } from "../../../../../lib/appointments";
import { todayISO } from "../../../../../lib/dates";
import { when } from "../../../../../lib/labels";

/**
 * On This week: the next appointment, once it's within a fortnight, with how
 * many questions are waiting for it; the way to them in the Planner. Nothing
 * further off: it's in the Planner until it's close. `null` lets This week
 * show the questions waiting on their own instead.
 */
export function NextAppointment() {
  const { data: appointments } = useAppointmentsQuery();
  const { data: waiting } = useQuestionsQuery({ select: (questions) => questions.filter((q) => !q.askedAt).length });
  const today = todayISO();
  const next = nextAppointment(appointments, today);
  const soon = next ? appointmentSoon(next, today) : null;
  if (!next || !soon) return null;
  return (
    <section aria-labelledby="next-appointment" className="flex flex-col gap-2">
      <h2 id="next-appointment" className="text-lg font-display font-semibold text-fg-strong">
        {soon === "Today" ? "Appointment today" : "Next appointment"}
      </h2>
      <Card size="sm" className="flex flex-col gap-1">
        <p className="flex items-center gap-2 font-medium text-fg-strong">
          <CalendarClock aria-hidden size={18} className="shrink-0 text-fg-brand" />
          {next.title}
        </p>
        <p className="pl-6.5 text-sm text-fg-normal">
          {soon === "Today" || soon === "Tomorrow" ? `${soon} · ` : null}
          {when(next.day, next.time, today, APPOINTMENT_WHEN)}
        </p>
        {next.place ? (
          <p className="flex items-center gap-1 pl-6.5 text-sm text-fg-subtle">
            <MapPin aria-hidden size={14} className="shrink-0" />
            {next.place}
          </p>
        ) : null}
        <Link to="/planner" hash="questions" className="-mb-2 flex min-h-11 items-center gap-1 pl-6.5 text-sm text-fg-subtle hover:text-fg-normal">
          {waiting === 0 ? "No questions for it yet" : waiting === 1 ? "1 question to ask" : `${waiting} questions to ask`}
          <ChevronRight aria-hidden size={16} />
        </Link>
      </Card>
    </section>
  );
}
