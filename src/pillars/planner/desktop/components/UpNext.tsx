import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { ISODate } from "../../../../lib/dates";
import { weekRange } from "../../../../lib/labels";
import type { Appointment } from "../../../../lib/planner/appointments";
import { type UpNextWeek, upNext } from "../../../../lib/planner/upNext";
import { type Week, weekFromNow } from "../../../../lib/timeline";
import { Fold } from "../../components/Fold";
import { ForNextAppointment, Questions } from "../../components/questions/ForNextAppointment";
import { NextUp } from "../../components/toDo/NextUp";
import { TaskLine } from "../../components/toDo/TaskLine";
import { ToDoProgress } from "../../components/toDo/ToDoProgress";
import { WhenNow } from "../../components/toDo/WhenNow";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { AddAppointment } from "../../features/appointments/components/AddAppointment";
import { AppointmentCard } from "../../features/appointments/components/AppointmentCard";
import { AddTask } from "../../features/tasks/components/addTask/AddTask";
import { useAppointmentsAhead } from "../../hooks/useAppointmentsAhead";
import { aheadWhen, missedWhen } from "../../model/labels";

/**
 * The Planner on a desktop, what's next: appointments and tasks in one
 * running order, a week at a time from this one (`upNext`), so it reads as
 * what to do next rather than as separate lists. The next appointment carries
 * the questions for it, there to tick off in the waiting room. Under the
 * weeks, what's missed and done, a task of your own, and the appointments
 * been. Further off is Across the weeks.
 */
export function UpNext({ now, dueDate }: { now: Week; dueDate: ISODate }) {
  const { plan } = usePlannerPage();
  const { next, later, past } = useAppointmentsAhead();
  const [adding, setAdding] = useState(false);
  const weeks = upNext(plan, next ? [next, ...later] : later, now, dueDate);
  // The questions go under the next appointment; when it's further off than Up next shows (or there's none), they close this week.
  const questionsShown = next !== null && weeks.some((w) => w.appointments.some((a) => a.id === next.id));

  return (
    <section aria-labelledby="up-next" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h2 id="up-next" className="text-lg font-display font-semibold text-fg-strong">
            Up next
          </h2>
          <ToDoProgress />
        </div>
        {adding ? null : (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus aria-hidden size={16} />
            Add appointment
          </Button>
        )}
      </div>
      {adding ? (
        <Card size="sm">
          <AddAppointment onAdded={() => setAdding(false)} onCancel={() => setAdding(false)} />
        </Card>
      ) : null}

      {weeks.map((w, i) => (
        <WeekOf key={w.week} entry={w} now={now} dueDate={dueDate} next={next} last={i === 0 && !questionsShown} />
      ))}

      <Link to="/planner/weeks" className="flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-fg-brand hover:underline">
        The rest of the run-up, across the weeks
        <ChevronRight aria-hidden size={16} />
      </Link>

      {plan.earlier.length > 0 ? (
        <Fold title="Missed earlier" count={plan.earlier.length} folded>
          {plan.earlier.map((task) => (
            <TaskLine key={task.id} task={task} when={<span>{missedWhen(task)}</span>} />
          ))}
        </Fold>
      ) : null}
      {plan.done.length > 0 ? (
        <Fold title="Done" count={plan.done.length} folded>
          {plan.done.map((task) => (
            <TaskLine key={task.id} task={task} />
          ))}
        </Fold>
      ) : null}
      {past.length > 0 ? (
        <Fold title="Appointments been" count={past.length} folded>
          <div className="flex flex-col gap-3">
            {past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </Fold>
      ) : null}
      {/* Expecting knows what needs doing; this is for the odd thing it couldn't. */}
      <AddTask week={now} />
    </section>
  );
}

/** One week of Up next: its heading and dates, its appointments (the next with its questions), then its tasks; `last` closes this week with the questions when they've nowhere else to go. */
function WeekOf({ entry, now, dueDate, next, last }: { entry: UpNextWeek; now: Week; dueDate: ISODate; next: Appointment | null; last: boolean }) {
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
          {a.id === next?.id ? (
            <section aria-label="Questions to ask at it" className="ml-4 flex flex-col gap-3 border-l-2 border-border-brand pl-4">
              <Questions />
            </section>
          ) : null}
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
      {last ? <ForNextAppointment /> : null}
    </section>
  );
}
