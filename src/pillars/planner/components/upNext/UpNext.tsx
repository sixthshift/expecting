import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import type { ISODate } from "../../../../lib/dates";
import { weekRange } from "../../../../lib/labels";
import type { Appointment } from "../../../../lib/planner/appointments";
import { openFor } from "../../../../lib/planner/questions";
import { type UpNextWeek, upNext } from "../../../../lib/planner/upNext";
import { type Week, weekFromNow } from "../../../../lib/timeline";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { AppointmentCard } from "../../features/appointments/components/AppointmentCard";
import { useAdding } from "../../features/appointments/hooks/useAdding";
import { AddTask } from "../../features/tasks/components/addTask/AddTask";
import { useAppointmentsAhead } from "../../hooks/useAppointmentsAhead";
import { aheadWhen } from "../../model/labels";
import { Been } from "../appointments/Appointments";
import { NextQuestions, QuestionsSection } from "../questions/Questions";
import { MissedAndDone } from "../toDo/MissedAndDone";
import { NextUp } from "../toDo/NextUp";
import { TaskLine } from "../toDo/TaskLine";
import { ToDoProgress } from "../toDo/ToDoProgress";
import { WhenNow } from "../toDo/WhenNow";

/**
 * The Planner on a desktop, what's next: appointments and tasks in one
 * running order, a week at a time from this one (`upNext`), so it reads as
 * what to do next rather than as separate lists. The next appointment carries
 * the questions for it, there to tick off in the waiting room. Under the
 * weeks, what's missed and done, a task of your own, and the appointments
 * been. Further off is Across the weeks. On a `phone`, where it's the first
 * of the Planner's tabs, its heading is the tab's, and the next appointment
 * says how many questions are waiting, the way to them in their own tab.
 */
export function UpNext({ now, dueDate, phone = false }: { now: Week; dueDate: ISODate; phone?: boolean }) {
  const { plan } = usePlannerPage();
  const { ahead, next } = useAppointmentsAhead();
  const { button, form } = useAdding();
  const weeks = upNext(plan, ahead, now, dueDate);
  // The questions go under the next appointment; when it's further off than Up next shows (or there's none), they close this week.
  const questionsShown = next !== null && weeks.some((w) => w.appointments.some((a) => a.id === next.id));

  return (
    <section aria-labelledby="up-next" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h2 id="up-next" className={phone ? "sr-only" : "text-lg font-display font-semibold text-fg-strong"}>
            Up next
          </h2>
          <ToDoProgress />
        </div>
        {button}
      </div>
      {form}

      {weeks.map((w, i) => (
        <WeekOf key={w.week} entry={w} now={now} dueDate={dueDate} next={next} last={i === 0 && !questionsShown && !phone} phone={phone} />
      ))}

      <Link to="/planner/weeks" className="flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-fg-brand hover:underline">
        The rest of the run-up, across the weeks
        <ChevronRight aria-hidden size={16} />
      </Link>

      <MissedAndDone />
      <Been title="Appointments been" />
      {/* Expecting knows what needs doing; this is for the odd thing it couldn't. */}
      <AddTask week={now} />
    </section>
  );
}

/** One week of Up next: its heading and dates, its appointments (the next with its questions), then its tasks; `last` closes this week with the questions when they've nowhere else to go. */
function WeekOf({
  entry,
  now,
  dueDate,
  next,
  last,
  phone,
}: {
  entry: UpNextWeek;
  now: Week;
  dueDate: ISODate;
  next: Appointment | null;
  last: boolean;
  phone: boolean;
}) {
  const { plan } = usePlannerPage();
  const dates = weekRange(entry.week, dueDate);
  return (
    <section aria-label={weekFromNow(entry.week, now)} className="flex flex-col gap-3">
      <h3 className="flex items-baseline gap-2 border-b border-border-subtle pb-1.5">
        <span className="text-xs font-semibold tracking-widest text-fg-strong uppercase">{weekFromNow(entry.week, now)}</span>
        <span className="text-xs text-fg-subtle">
          Week {entry.week}
          {dates ? ` · ${dates}` : ""}
        </span>
      </h3>
      {entry.appointments.map((a) => (
        <div key={a.id} className="flex flex-col gap-3">
          <AppointmentCard appointment={a} size={a.id === next?.id ? "md" : "sm"} />
          {a.id !== next?.id ? null : phone ? (
            <QuestionsWaitingLink appointmentId={a.id} />
          ) : (
            <section aria-label="Questions to ask at it" className="ml-4 flex flex-col gap-3 border-l-2 border-border-brand pl-4">
              <NextQuestions appointmentId={a.id} />
            </section>
          )}
        </div>
      ))}
      {entry.now.map((e) =>
        e.task.id === plan.next?.task.id ? <NextUp key={e.task.id} entry={e} /> : <TaskLine key={e.task.id} task={e.task} when={<WhenNow entry={e} />} />
      )}
      {entry.ahead.map((a) => (
        <TaskLine key={a.task.id} task={a.task} when={<span>{aheadWhen(a)}</span>} />
      ))}
      {entry.appointments.length === 0 && entry.now.length === 0 && entry.ahead.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-fg-subtle">
          <CalendarDays aria-hidden size={16} />
          Nothing booked or due this week.
        </p>
      ) : null}
      {last ? <QuestionsSection /> : null}
    </section>
  );
}

/** On a phone, under the next appointment: how many questions are waiting for it, to the Questions tab. */
function QuestionsWaitingLink({ appointmentId }: { appointmentId: string }) {
  const { data: waiting } = useQuestionsQuery({ select: (questions) => openFor(questions, appointmentId).length });
  return (
    <Link to="/planner/questions" className="-mt-1 ml-4 flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-fg-brand hover:underline">
      {waiting === 0 ? "Questions for it" : waiting === 1 ? "1 question to ask" : `${waiting} questions to ask`}
      <ChevronRight aria-hidden size={16} />
    </Link>
  );
}
