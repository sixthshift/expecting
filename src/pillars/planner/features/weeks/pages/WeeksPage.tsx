import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useChecklistQuery } from "../../../../../api/rpc/checklist";
import { useNow } from "../../../../../api/rpc/settings";
import { PillarLayout } from "../../../../../app/components/layout/PillarLayout";
import type { Task } from "../../../../../content/schema";
import { stageEnding } from "../../../../../lib/planner/plan";
import { weeksChart } from "../../../../../lib/planner/weeks";
import type { Week } from "../../../../../lib/timeline";
import { useItems } from "../../../../library/hooks/useItems";
import { usePlan } from "../../../hooks/usePlan";
import { WeeksChart } from "../components/WeeksChart";

const route = getRouteApi("/app/planner/weeks");

/**
 * The weeks ("Across the weeks" on screen): To do drawn as a chart, for when you want the whole run of
 * it at once. The same plan as To do, in the same groups; opened from Ahead's
 * heading, or from a stage's card at that stage. While something has
 * happened, put away like To do.
 */
export function WeeksPage() {
  const { stage } = route.useSearch();
  const { data: checklist } = useChecklistQuery();
  const now = useNow();
  // Nothing ticked during this visit here: the chart is for looking, and ticking is To do's.
  const { plan, stages } = usePlan();
  const items = useItems();
  const ends = useMemo(() => new Map(items.map((i) => [i.id, i.to])), [items]);
  const chart = weeksChart(plan, stages, checklist.ticks, now, (task: Task): Week | null => (task.itemId ? (ends.get(task.itemId) ?? null) : null));
  const focus = stage === undefined ? null : stageEnding(stage);

  // Opened at a stage: bring its group into view, once the router has put the page at its top.
  useEffect(() => {
    if (stage === undefined) return;
    const frame = requestAnimationFrame(() => document.querySelector(`[data-stage="${stage}"]`)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  return (
    <PillarLayout
      back={{ to: "/planner", label: "Planner" }}
      className="gap-6"
      title="Across the weeks"
      lead="When each thing opens, when it's best done by, and when it closes."
      putAway={{ subject: "The to-do list", aside: true }}
    >
      <WeeksChart chart={chart} now={now} focus={focus} />
    </PillarLayout>
  );
}
