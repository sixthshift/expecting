import { ChevronRight } from "lucide-react";
import type { Item, Task } from "../../../../content/schema";
import { type QuietKind, setInMotion } from "../../../../lib/quiet";
import { ItemLink } from "../../../library/components/ItemLink";

/**
 * The Planner's To do while Expecting is quiet: nothing to do, the list put
 * aside rather than deleted, and what you'd already set in motion, for when
 * you're ready: claims that may still matter, and bookings you might cancel.
 */
export function PutAside({
  kind,
  tasks,
  ticks,
  items,
}: {
  kind: QuietKind;
  tasks: readonly Task[];
  ticks: Readonly<Record<string, string>>;
  items: readonly Item[];
}) {
  const { claims, bookings } = setInMotion(tasks, ticks, items);
  return (
    <section aria-labelledby="todo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="todo" className="text-lg font-display font-semibold text-fg-strong">
          To do
        </h2>
        <p className="max-w-prose text-fg-normal">Nothing needs doing. The to-do list is put aside, not deleted.</p>
      </div>
      {claims.length > 0 ? (
        <Done
          id="claims"
          title="Claims you've started"
          lead="Some may still apply, and some may need stopping."
          tasks={claims}
          more={kind === "loss" ? { id: "leave-after-loss", label: "Leave and pay after a loss" } : undefined}
        />
      ) : null}
      {bookings.length > 0 ? (
        <Done
          id="bookings"
          title="Already booked or done"
          lead="You might want to cancel some of these, when you're ready. There's no hurry."
          tasks={bookings}
        />
      ) : null}
    </section>
  );
}

function Done({ id, title, lead, tasks, more }: { id: string; title: string; lead: string; tasks: readonly Task[]; more?: { id: string; label: string } }) {
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
