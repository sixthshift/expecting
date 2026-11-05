import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { toast } from "@sixthshift/design-system/overlay";
import { checklistSaves } from "../../../../api/rpc/checklist";
import { useSave } from "../../../../app/hooks/useSave";
import type { OneThing } from "../../../../lib/home/oneThing";
import { type ToDo, whenToDo } from "../../../../lib/planner/todo";
import type { Week } from "../../../../lib/timeline";
import { CheckIn } from "../../../journal/features/feelings/components/checkIn/CheckIn";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";
import { NextAppointment } from "../../../planner/features/appointments/components/NextAppointment";
import { Whose } from "../../../planner/features/tasks/components/Whose";
import { DayByDay } from "../../components/dayByDay/DayByDay";
import { useHomePage } from "../../contexts/HomePageContext";

/**
 * The top of Home on a phone: the one thing that matters most now, shown
 * whole with what to do about it (`useTheOneThing`): an appointment today,
 * something late, how you are, the next thing to do, or the day's read. Under
 * it, what's then.
 */
export function TheOneThing({ thing, after }: { thing: OneThing; after: OneThing | undefined }) {
  return (
    <div className="flex flex-col gap-2">
      <Shown thing={thing} />
      {after && after.kind !== "read" ? <p className="px-1 text-sm text-fg-subtle">Then: {thenLabel(after)}</p> : null}
    </div>
  );
}

function Shown({ thing }: { thing: OneThing }) {
  const { now } = useHomePage();
  switch (thing.kind) {
    case "appointment":
      return <NextAppointment />;
    case "task":
      return now === null ? null : <TaskFirst toDo={thing.toDo} now={now} />;
    case "checkIn":
      return <CheckIn />;
    case "read":
      return <DayByDay />;
  }
}

/** A task as the one thing: when, whose, why, and Done. */
function TaskFirst({ toDo, now }: { toDo: ToDo; now: Week }) {
  const save = useSave(checklistSaves.setTicked);
  const { task, why } = toDo;
  const late = why !== "soon";
  function done() {
    save({ taskId: task.id, ticked: true });
    toast({ title: "Ticked off", children: task.title, action: "Undo", onAction: () => save({ taskId: task.id, ticked: false }) });
  }
  return (
    <section aria-labelledby="one-thing" className="flex flex-col gap-3 rounded-xl border border-border-brand bg-bg-normal p-5 shadow-sm">
      <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-fg-subtle uppercase">
        Next
        {late ? (
          <Badge size="sm" variant="soft" intent="warning">
            {whenToDo(toDo, now)}
          </Badge>
        ) : (
          <span className="font-normal tracking-normal normal-case">· {whenToDo(toDo, now)}</span>
        )}
        <Whose who={task.who} />
      </p>
      <h2 id="one-thing" className="font-display text-2xl font-semibold text-fg-strong">
        {task.title}
      </h2>
      <div className="flex items-center gap-3">
        <Button onClick={done}>Done</Button>
        {task.itemId ? (
          <ItemLink itemId={task.itemId} aria-label={`Why: ${task.title}`} className="flex min-h-11 items-center px-2 text-sm font-medium text-fg-brand">
            Why
          </ItemLink>
        ) : null}
      </div>
    </section>
  );
}

/** What's then, in a few words. */
function thenLabel(thing: OneThing): string {
  switch (thing.kind) {
    case "appointment":
      return "today's appointment";
    case "task":
      return thing.toDo.task.title;
    case "checkIn":
      return "how you are today";
    case "read":
      return "today's read";
  }
}
