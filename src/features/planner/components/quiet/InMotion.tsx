import { ChevronRight } from "lucide-react";
import type { Task } from "../../../../content/schema";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";

/** Some of what was set in motion before: a heading and a line on it, each task to its item, and perhaps one more entry to read. */
export function InMotion({
  id,
  title,
  lead,
  tasks,
  more,
}: {
  id: string;
  title: string;
  lead: string;
  tasks: readonly Task[];
  more?: { id: string; label: string };
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 id={id} className="text-sm font-semibold text-fg-normal">
          {title}
        </h3>
        <p className="text-sm text-fg-subtle">{lead}</p>
      </div>
      <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
        {tasks.map((task) => (
          <li key={task.id}>
            {task.itemId ? (
              <ItemLink itemId={task.itemId} className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 text-fg-normal hover:bg-bg-normal-hovered">
                {task.title}
                <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
              </ItemLink>
            ) : (
              <span className="flex min-h-12 items-center px-4 py-2 text-fg-normal">{task.title}</span>
            )}
          </li>
        ))}
      </ul>
      {more ? (
        <ItemLink itemId={more.id} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          {more.label}
          <ChevronRight aria-hidden size={16} />
        </ItemLink>
      ) : null}
    </section>
  );
}
