import { Badge } from "@sixthshift/design-system/badge";
import { type ToDo, whenToDo } from "../../../../../lib/planner/todo";
import type { Week } from "../../../../../lib/timeline";

/** When a task to do now is due, in a few words, this week being `now`: a deadline as a warning. */
export function WhenToDo({ entry, now }: { entry: ToDo; now: Week }) {
  return entry.why === "deadline" ? (
    <Badge size="sm" variant="soft" intent="warning">
      {whenToDo(entry, now)}
    </Badge>
  ) : (
    <span>{whenToDo(entry, now)}</span>
  );
}
