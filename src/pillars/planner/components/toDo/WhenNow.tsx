import type { ToDo } from "../../../../lib/planner/todo";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { WhenToDo } from "../../features/tasks/components/WhenToDo";

/** When a task to do now is due (`WhenToDo`), in the Planner's week. Only where there's a now. */
export function WhenNow({ entry }: { entry: ToDo }) {
  const { now } = usePlannerPage();
  return now === null ? null : <WhenToDo entry={entry} now={now} />;
}
