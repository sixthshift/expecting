import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import type { Task } from "../../../content/schema";
import { chartOf } from "../../../lib/acrossTheWeeks";
import { planTasks, stageEnding, stagesAhead } from "../../../lib/planner";
import type { Week } from "../../../lib/timeline";
import { useItems } from "../../library/hooks/useItems";
import { useTasks } from "../../tasks/hooks/useTasks";
import { WeeksChart } from "../components/weeks/WeeksChart";

const route = getRouteApi("/app/planner/weeks");

/** Nothing ticked during this visit here: the chart is for looking, and ticking is To do's. */
const NONE: ReadonlySet<string> = new Set();

/**
 * Across the weeks: To do drawn as a chart, for when you want the whole run of
 * it at once. The same plan as To do, in the same groups; opened from Ahead's
 * heading, or from a stage's card at that stage. While something has
 * happened, put away like To do.
 */
export function WeeksPage() {
  const { stage } = route.useSearch();
  const { data: checklist } = useChecklistQuery();
  const { data: quiet } = useQuietQuery();
  const now = useNow();
  const tasks = useTasks();
  const items = useItems();
  const ends = useMemo(() => new Map(items.map((i) => [i.id, i.to])), [items]);
  const plan = planTasks(tasks, checklist.ticks, NONE, now);
  const chart = chartOf(plan, stagesAhead(plan), checklist.ticks, now, (task: Task): Week | null => (task.itemId ? (ends.get(task.itemId) ?? null) : null));
  const focus = stage === undefined ? null : stageEnding(stage);

  // Opened at a stage: bring its group into view, once the router has put the page at its top.
  useEffect(() => {
    if (stage === undefined) return;
    const frame = requestAnimationFrame(() => document.querySelector(`[data-stage="${stage}"]`)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex flex-col gap-6">
        <div>
          <Link to="/planner" className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
            <ArrowLeft aria-hidden size={16} /> Planner
          </Link>
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">Across the weeks</h1>
          <p className="mt-1 max-w-prose text-fg-subtle">When each thing opens, when it's best done by, and when it closes.</p>
        </div>
        {quiet ? (
          <p className="max-w-prose text-sm text-fg-subtle">The to-do list is put aside while Expecting is quiet. Nothing is deleted.</p>
        ) : (
          <WeeksChart chart={chart} now={now} focus={focus} />
        )}
      </div>
    </main>
  );
}
