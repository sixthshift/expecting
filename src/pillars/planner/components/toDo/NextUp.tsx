import { Card } from "@sixthshift/design-system/card";
import { ChevronRight } from "lucide-react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import type { ToDo } from "../../../../lib/planner/todo";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";
import { useItems } from "../../../library/hooks/useItems";
import { DeleteOwnTask } from "../../features/tasks/components/addTask/DeleteOwnTask";
import { TaskRow } from "../../features/tasks/components/TaskRow";
import { Whose } from "../../features/tasks/components/Whose";
import { WhenNow } from "./WhenNow";

/** The one thing to do first, given room: when, whose, and why it matters. Ticking it brings up the next. */
export function NextUp({ entry }: { entry: ToDo }) {
  const { task } = entry;
  const { data: ticked } = useChecklistQuery({ select: (c) => Boolean(c.ticks[task.id]) });
  const item = useItems().find((i) => i.id === task.itemId);
  return (
    <section aria-labelledby="next-up" className="flex flex-col gap-2">
      <h3 id="next-up" className="text-sm font-semibold text-fg-normal">
        Next up
      </h3>
      <Card size="lg" className="flex flex-col gap-2">
        <TaskRow task={task} ticked={ticked} action={task.origin === "own" ? <DeleteOwnTask task={task} /> : null} />
        <div className="flex flex-col gap-2 pl-9">
          <span className="flex flex-wrap items-center gap-x-2 text-sm text-fg-subtle">
            <WhenNow entry={entry} />
            <Whose who={task.who} />
          </span>
          {item?.summary ? <p className="max-w-prose text-sm text-fg-normal">{item.summary}</p> : null}
          {item ? (
            <ItemLink
              itemId={item.id}
              aria-label={`Why: ${task.title}`}
              className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal"
            >
              Why it matters, and how
              <ChevronRight aria-hidden size={16} />
            </ItemLink>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
