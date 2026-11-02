import { Badge } from "@sixthshift/design-system/badge";
import { type ToDo, whenToDo } from "../../../../lib/todo";
import { usePlannerPage } from "../../contexts/PlannerPageContext";

/** When a task to do now is due, in a few words: a deadline as a warning. Only where there's a now. */
export function WhenNow({ entry }: { entry: ToDo }) {
  const { now } = usePlannerPage();
  if (now === null) return null;
  return entry.why === "deadline" ? (
    <Badge size="sm" variant="soft" intent="warning">
      {whenToDo(entry, now)}
    </Badge>
  ) : (
    <span>{whenToDo(entry, now)}</span>
  );
}
