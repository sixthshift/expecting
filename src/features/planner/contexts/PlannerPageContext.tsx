import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";
import { useAppointmentsQuery } from "../../../api/rpc/appointments";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import { type Appointment, splitAppointments } from "../../../lib/appointments";
import { todayISO } from "../../../lib/dates";
import type { Plan, Stage } from "../../../lib/planner/plan";
import type { QuietKind } from "../../../lib/quiet";
import type { Week } from "../../../lib/timeline";
import { usePlan } from "../hooks/usePlan";

/**
 * The Planner's context: what its page works out once, and what several of
 * its parts must agree on. What only one part needs, that part works out
 * (a task's tick, whose it is, the questions).
 */
export type PlannerPage = {
  /** This week, or null without a due date: no now, everything ahead. */
  now: Week | null;
  /** What has happened, or null: To do is put aside while it's quiet. */
  quiet: QuietKind | null;
  /** Every task placed: next up, also now, ahead, missed earlier, done. */
  plan: Plan;
  /** What's ahead, as stages. */
  stages: Stage[];
  /** Keep a task just ticked where it is, until the next visit. */
  stay: (taskId: string) => void;
  /** The appointments: the next (today's counts), the rest still ahead, and those gone, latest first. */
  appointments: { next: Appointment | null; later: Appointment[]; past: Appointment[] };
};

const PageContext = createContext<PlannerPage | null>(null);

/**
 * The Planner's context: the plan, built once for To do from the tasks and
 * ticks, with what's ticked during this visit kept in place; and the
 * appointments split once, for their own part and for the questions'
 * heading. It holds no data of its own: the queries stay in the query cache.
 */
export function PlannerPageProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  const { data: quietNow } = useQuietQuery();
  const quiet = quietNow?.kind ?? null;
  // Ticked during this visit: they stay where they were until the next one.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const stay = useCallback((taskId: string) => setTickedHere((ids) => new Set(ids).add(taskId)), []);
  const { plan, stages } = usePlan(tickedHere);
  const { data: all } = useAppointmentsQuery();
  const today = todayISO();
  const appointments = useMemo(() => {
    const { ahead, past } = splitAppointments(all, today);
    const [next = null, ...later] = ahead;
    return { next, later, past };
  }, [all, today]);

  const page = useMemo(() => ({ now, quiet, plan, stages, stay, appointments }), [now, quiet, plan, stages, stay, appointments]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** What the Planner's page draws, inside `PlannerPageProvider`. */
export function usePlannerPage(): PlannerPage {
  const page = use(PageContext);
  if (!page) throw new Error("usePlannerPage must be called inside PlannerPageProvider");
  return page;
}
