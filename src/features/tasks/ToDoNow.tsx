import { Badge } from "@sixthshift/design-system/badge";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { whose } from "../../lib/people";
import { compareSlots, type Slot, sameSlot, slotLabel } from "../../lib/timeline";
import { type ToDo, toDoNow } from "../../lib/todo";
import { usePhaseTo } from "../app/usePhaseTo";
import { useApp } from "../household/useApp";
import { TaskRow } from "./TaskRow";

/** How many To do now shows before handing over to the Planner. */
const SHOWN = 5;

const week = (slot: Slot) => slotLabel(slot).toLowerCase();

/** When, in a few words: "deadline week 30", "was due week 25", "this week", "by week 30". */
function when({ task, why }: ToDo, now: Slot): string {
  if (why === "deadline" && task.deadline) {
    return compareSlots(task.deadline, now) < 0 ? `deadline was ${week(task.deadline)}` : `deadline ${week(task.deadline)}`;
  }
  if (why === "slipped") return task.due.phase === "preconception" ? "best done before now" : `was due ${week(task.due)}`;
  return sameSlot(task.due, now) ? "this week" : `by ${week(task.due)}`;
}

/**
 * What This week opens with: the few things to do now, most urgent first,
 * each with when, whose (when it's one of you), and a way to why. The rest
 * is in the Planner.
 */
export function ToDoNow() {
  const { state, now, tasks } = useApp();
  const to = usePhaseTo();
  if (!now) return null;
  const list = toDoNow(tasks, state.ticks, now);
  const shown = list.slice(0, SHOWN);

  return (
    <section aria-labelledby="to-do-now" className="mb-6 flex flex-col gap-2">
      <h2 id="to-do-now" className="text-lg font-semibold text-fg-strong">
        To do now
      </h2>
      {shown.length === 0 ? (
        <p className="text-fg-subtle">Nothing needs doing right now.</p>
      ) : (
        <div className="flex flex-col">
          {shown.map((entry) => (
            <TaskRow
              key={entry.task.id}
              task={entry.task}
              ticked={false}
              stack
              meta={
                <span className="flex flex-wrap items-center gap-x-2">
                  {entry.why === "deadline" ? (
                    <Badge size="sm" variant="soft" intent="warning">
                      {when(entry, now)}
                    </Badge>
                  ) : (
                    <span>{when(entry, now)}</span>
                  )}
                  {/* Both of yours is the usual; only one person's job says whose. */}
                  {entry.task.who === "together" ? null : <span>{whose(entry.task.who, state.me, state.people)}</span>}
                </span>
              }
              action={
                entry.task.itemId ? (
                  <Link
                    to={to("/library/$itemId")}
                    params={{ itemId: entry.task.itemId }}
                    aria-label={`Why: ${entry.task.title}`}
                    className="shrink-0 px-1 text-xs text-fg-subtle underline"
                  >
                    Why
                  </Link>
                ) : null
              }
            />
          ))}
        </div>
      )}
      <Link to={to("/planner")} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        {list.length > SHOWN ? `${list.length - SHOWN} more, and everything else, in the Planner` : "Everything in the Planner"}
        <ChevronRight aria-hidden size={16} />
      </Link>
    </section>
  );
}
