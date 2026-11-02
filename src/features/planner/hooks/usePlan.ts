import { useMemo } from "react";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useNow } from "../../../api/rpc/settings";
import { type Plan, planTasks, type Stage, stagesAhead } from "../../../lib/planner/plan";
import { useTasks } from "../../tasks/hooks/useTasks";

/** Nothing ticked during this visit: where the plan is only looked at (the weeks). */
const NONE: ReadonlySet<string> = new Set();

/**
 * The plan, To do's and the weeks' alike: every task placed (next, now,
 * ahead, earlier, done) and what's ahead as stages, as the tasks and ticks
 * change. `tickedHere`: ticked during this visit, kept where they were.
 */
export function usePlan(tickedHere: ReadonlySet<string> = NONE): { plan: Plan; stages: Stage[] } {
  const tasks = useTasks();
  const { data: ticks } = useChecklistQuery({ select: (c) => c.ticks });
  const now = useNow();
  return useMemo(() => {
    const plan = planTasks(tasks, ticks, tickedHere, now);
    return { plan, stages: stagesAhead(plan) };
  }, [tasks, ticks, tickedHere, now]);
}
