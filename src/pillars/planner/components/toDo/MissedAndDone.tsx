import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { missedWhen } from "../../model/labels";
import { Fold } from "../Fold";
import { TaskLine } from "./TaskLine";

/** What's behind you in the plan, each folded away: what was missed earlier, and what's done. */
export function MissedAndDone() {
  const { plan } = usePlannerPage();
  return (
    <>
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
    </>
  );
}
