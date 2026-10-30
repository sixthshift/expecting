import { Badge } from "@sixthshift/design-system/badge";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useChecklist } from "../../../../api/rpc/checklist";
import { usePeople } from "../../../../api/rpc/people";
import { useNow } from "../../../../api/rpc/settings";
import { whose } from "../../../../lib/people";
import { toDoNow, whenToDo } from "../../../../lib/todo";
import { ItemLink } from "../../../library/components/ItemLink";
import { useTasks } from "../../hooks/useTasks";
import { TaskRow } from "../TaskRow";

/** How many To do now shows before handing over to the Planner. */
const SHOWN = 5;

/**
 * What This week opens with: the few things to do now, most urgent first,
 * each with when, whose (when it's one of you), and a way to why. The rest
 * is in the Planner.
 */
export function ToDoNow() {
  const { me, people } = usePeople().data;
  const { data: checklist } = useChecklist();
  const now = useNow();
  const tasks = useTasks();
  if (now === null) return null;
  const list = toDoNow(tasks, checklist.ticks, now);
  const shown = list.slice(0, SHOWN);

  return (
    <section aria-labelledby="to-do-now" className="flex flex-col gap-2">
      <h2 id="to-do-now" className="text-lg font-display font-semibold text-fg-strong">
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
                      {whenToDo(entry, now)}
                    </Badge>
                  ) : (
                    <span>{whenToDo(entry, now)}</span>
                  )}
                  {/* Both of yours is the usual; only one person's job says whose. */}
                  {entry.task.who === "together" ? null : <span>{whose(entry.task.who, me, people)}</span>}
                </span>
              }
              action={
                entry.task.itemId ? (
                  <ItemLink itemId={entry.task.itemId} aria-label={`Why: ${entry.task.title}`} className="shrink-0 px-1 text-xs text-fg-subtle underline">
                    Why
                  </ItemLink>
                ) : null
              }
            />
          ))}
        </div>
      )}
      <Link to="/planner" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        {list.length > SHOWN ? `${list.length - SHOWN} more, and everything else, in the Planner` : "Everything in the Planner"}
        <ChevronRight aria-hidden size={16} />
      </Link>
    </section>
  );
}
