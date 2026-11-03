import { createContext, type ReactNode, use, useMemo } from "react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import type { Task } from "../../../../content/schema";
import { setInMotion } from "../../../../lib/planner/quiet";
import type { QuietKind } from "../../../../lib/quiet";
import { useItems } from "../../../library/hooks/useItems";
import { useTasks } from "../../features/tasks/hooks/useTasks";

/**
 * The quiet Planner's context: what its page works out once while something
 * has happened. No plan, no stages, no ticks kept in place: To do is put aside.
 */
export type QuietPlannerPage = {
  /** What has happened: null only once it's lifted, before the route draws the other world. */
  kind: QuietKind | null;
  /** What was already set in motion: claims that may still matter, and bookings you might cancel. */
  inMotion: { claims: Task[]; bookings: Task[] };
};

const PageContext = createContext<QuietPlannerPage | null>(null);

/**
 * The quiet Planner's context: what has happened, and what was set in motion
 * (the tasks already ticked), worked out once. It holds no data of its own:
 * the queries stay in the query cache. Drawn only while it's quiet.
 */
export function QuietPlannerPageProvider({ children }: { children: ReactNode }) {
  const { data: quiet } = useQuietQuery();
  const kind = quiet?.kind ?? null;
  const tasks = useTasks();
  const { data: ticks } = useChecklistQuery({ select: (c) => c.ticks });
  const items = useItems();
  const inMotion = useMemo(() => setInMotion(tasks, ticks, items), [tasks, ticks, items]);

  const page = useMemo(() => ({ kind, inMotion }), [kind, inMotion]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** What the quiet Planner's page draws, inside `QuietPlannerPageProvider`. */
export function useQuietPlannerPage(): QuietPlannerPage {
  const page = use(PageContext);
  if (!page) throw new Error("useQuietPlannerPage must be called inside QuietPlannerPageProvider");
  return page;
}
