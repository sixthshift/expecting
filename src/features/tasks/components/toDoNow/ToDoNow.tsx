import { Badge } from "@sixthshift/design-system/badge";
import { toast } from "@sixthshift/design-system/overlay";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { checklistSaves, useChecklist } from "../../../../api/rpc/checklist";
import { usePeople } from "../../../../api/rpc/people";
import { useNow } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { toDoNow, whenToDo } from "../../../../lib/todo";
import { ItemLink } from "../../../library/components/ItemLink";
import { useTasks } from "../../hooks/useTasks";
import { TaskRow } from "../TaskRow";
import { Whose } from "../Whose";

/** How many To do now shows before handing over to the Planner. */
const SHOWN = 5;

/** How long a ticked task stays in the list, struck through and then folding away (TaskRow's `leaving`). */
const LEAVING_MS = 750;

/**
 * What This week opens with: the few things to do now, most urgent first,
 * each with when, whose (when it's one of you), and a way to why. The rest
 * is in the Planner. A ticked task leaves the list, after a beat to see it
 * ticked, and a toast offers it back.
 */
export function ToDoNow() {
  const { me, people } = usePeople().data;
  const { data: checklist } = useChecklist();
  const now = useNow();
  const tasks = useTasks();
  const save = useSave(checklistSaves.setTicked);
  const leaving = useLeaving();
  if (now === null) return null;
  // The ones just ticked are listed as if they weren't, so they stay in their place while they go.
  const { [leaving.id ?? ""]: _, ...ticks } = checklist.ticks;
  const list = toDoNow(tasks, leaving.id ? ticks : checklist.ticks, now);
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
              ticked={entry.task.id === leaving.id}
              leaving={entry.task.id === leaving.id}
              onTick={(ticked) => {
                if (!ticked) return;
                leaving.start(entry.task.id);
                toast({
                  title: "Ticked off",
                  children: entry.task.title,
                  action: "Undo",
                  onAction: () => save({ taskId: entry.task.id, ticked: false }),
                });
              }}
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
                  <Whose who={entry.task.who} me={me} people={people} />
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

/** The task just ticked, kept in the list while it folds away; a second tick before it has gone sends the first on its way. */
function useLeaving() {
  const [id, setId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    id,
    start(next: string) {
      clearTimeout(timer.current);
      setId(next);
      timer.current = setTimeout(() => setId(null), LEAVING_MS);
    },
  };
}
