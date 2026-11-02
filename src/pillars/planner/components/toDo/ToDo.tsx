import { WEEKS } from "../../../../lib/timeline";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { AddTask } from "../../features/tasks/components/addTask/AddTask";
import { missedWhen } from "../../model/labels";
import { Fold } from "../Fold";
import { Ahead } from "./Ahead";
import { NextUp } from "./NextUp";
import { TaskLine } from "./TaskLine";
import { ToDoProgress } from "./ToDoProgress";
import { WhenNow } from "./WhenNow";

/**
 * To do, the plan (src/lib/planner/plan.ts): the one thing to do next, then
 * the rest of what to do now, with what's ahead, missed and done folded away,
 * and a task of your own.
 */
export function ToDo() {
  const { plan, now } = usePlannerPage();
  return (
    <section aria-labelledby="todo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="todo" className="text-lg font-display font-semibold text-fg-strong">
          To do
        </h2>
        <ToDoProgress />
      </div>

      {now !== null && plan.next ? <NextUp entry={plan.next} /> : null}
      {now !== null && !plan.next ? <p className="text-fg-normal">Nothing needs doing right now. What's ahead is below, when you want a look.</p> : null}

      {now !== null && plan.now.length > 0 ? (
        <Fold title="Also now" count={plan.now.length}>
          {plan.now.map((entry) => (
            <TaskLine key={entry.task.id} task={entry.task} when={<WhenNow entry={entry} />} />
          ))}
        </Fold>
      ) : null}

      <Ahead />

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

      {/* Expecting knows what needs doing; this is for the odd thing it couldn't. */}
      <AddTask week={now ?? WEEKS.first} />
    </section>
  );
}
