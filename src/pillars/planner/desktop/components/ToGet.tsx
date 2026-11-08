import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { inPlanner, leftSaying } from "../../../../lib/planner/lists/summaries";
import { listIcon } from "../../features/lists/components/icons";
import { useListSummaries } from "../../features/lists/hooks/useLines";

/**
 * What's still to get, beside Up next on a desktop: the lists have no dates,
 * so they aren't on it. Each list with what's left in its own words, got and
 * arranged as one bar, and the first few still to get; the way into it (for
 * a shop: Just what's left), and to a list of your own.
 */
export function ToGet() {
  const all = useListSummaries().filter(inPlanner);

  return (
    <section aria-labelledby="to-get" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="to-get" className="text-lg font-display font-semibold text-fg-strong">
          To get
        </h2>
        <Link to="/planner/lists" className="flex min-h-11 items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          All lists
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
      <Card size="md" className="flex flex-col divide-y divide-border-subtle">
        {all.map((list) => {
          const Icon = listIcon(list.id);
          return (
            <Link key={list.id} to="/planner/lists/$listId" params={{ listId: list.id }} className="group flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium text-fg-strong group-hover:underline">
                  <Icon aria-hidden size={16} className="text-fg-brand" />
                  {list.title}
                </span>
                <span className="text-sm text-fg-subtle">{leftSaying(list.id, list)}</span>
              </span>
              {list.total > 0 ? <Bar got={list.got} arranged={list.arranged} total={list.total} /> : null}
              {list.next.length > 0 ? (
                <span className="text-sm text-fg-subtle">
                  {list.next.join(" · ")}
                  {list.left > list.next.length ? ` · and ${list.left - list.next.length} more` : ""}
                </span>
              ) : null}
            </Link>
          );
        })}
        <Link to="/planner/lists" className="flex min-h-11 items-center pt-3 text-sm text-fg-subtle underline hover:text-fg-normal">
          {all.length === 0 ? "Start a list of your own" : "A list of your own"}
        </Link>
      </Card>
    </section>
  );
}

/** Got and arranged, of everything on a list (but the not-needed), as one bar; read out in words. */
function Bar({ got, arranged, total }: { got: number; arranged: number; total: number }) {
  return (
    <span
      role="img"
      aria-label={`${got} of ${total} got${arranged ? `, ${arranged} arranged` : ""}`}
      className="flex h-1.5 overflow-hidden rounded-full bg-bg-subtle"
    >
      <span className="bg-bg-brand-strong" style={{ width: `${(got / total) * 100}%` }} />
      <span className="bg-bg-brand" style={{ width: `${(arranged / total) * 100}%` }} />
    </span>
  );
}
