import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";
import { useNow } from "../../../api/rpc/settings";
import type { Plan, Stage } from "../../../lib/planner/plan";
import type { Week } from "../../../lib/timeline";
import { usePlan } from "../hooks/usePlan";

/**
 * The Planner's context: what its page works out once, and what several of
 * its parts must agree on. What only one part needs, that part works out
 * (a task's tick, whose it is, the questions, the appointments).
 */
export type PlannerPage = {
  /** This week, or null without a due date: no now, everything ahead. */
  now: Week | null;
  /** Every task placed: next up, also now, ahead, missed earlier, done. */
  plan: Plan;
  /** What's ahead, as stages. */
  stages: Stage[];
  /** Keep a task just ticked where it is, until the next visit. */
  stay: (taskId: string) => void;
};

const PageContext = createContext<PlannerPage | null>(null);

/**
 * The Planner's context: the plan, built once for To do from the tasks and
 * ticks, with what's ticked during this visit kept in place. It holds no
 * data of its own: the queries stay in the query cache.
 */
export function PlannerPageProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  // Ticked during this visit: they stay where they were until the next one.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const stay = useCallback((taskId: string) => setTickedHere((ids) => new Set(ids).add(taskId)), []);
  const { plan, stages } = usePlan(tickedHere);

  const page = useMemo(() => ({ now, plan, stages, stay }), [now, plan, stages, stay]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** What the Planner's page draws, inside `PlannerPageProvider`. */
export function usePlannerPage(): PlannerPage {
  const page = use(PageContext);
  if (!page) throw new Error("usePlannerPage must be called inside PlannerPageProvider");
  return page;
}
