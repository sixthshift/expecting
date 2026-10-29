// The household as every pillar sees it: its queries (src/features/household/load.ts),
// tailored (only the items and tasks its facts and extras fit, each task timed by them)
// and placed in time. Worked out once, by AppProvider around the pillars, and read
// by each of them with useApp().

import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, use, useMemo } from "react";
import { builtInItems, builtInTasks } from "../../content";
import { applies } from "../../content/facts";
import { buildChecklist } from "../../lib/checklist";
import { todayISO } from "../../lib/dates";
import { extrasOn, inExtras } from "../../lib/extras";
import { factsOf, timeTask } from "../../lib/facts";
import { positionOn } from "../../lib/timeline";
import { householdQuery, questionsQuery } from "./load";

function useHousehold() {
  const { data: state } = useSuspenseQuery(householdQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const { dueDate } = state.household;
  const facts = useMemo(() => factsOf(state.answers), [state.answers]);
  const today = todayISO();
  const position = useMemo(() => (dueDate ? positionOn(today, dueDate) : null), [today, dueDate]);
  // This week; null until there's a due date.
  const now = position?.week ?? null;

  // Tailored: an item, and its tasks, only for a household its `when` fits, and in an extra only once that's on.
  const on = useMemo(() => extrasOn(state.extras), [state.extras]);
  const items = useMemo(() => builtInItems.filter((i) => applies(i.when, facts) && inExtras(i.extra, on)), [facts, on]);
  const tasks = useMemo(() => {
    const shown = new Set(items.map((i) => i.id));
    return buildChecklist(
      builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)).map((t) => timeTask(t, facts, dueDate)),
      state.ownTasks
    );
  }, [items, facts, dueDate, state.ownTasks]);

  return useMemo(
    () => ({ state, questions, today, position, now, facts, extras: on, items, tasks }),
    [state, questions, today, position, now, facts, on, items, tasks]
  );
}

const AppContext = createContext<ReturnType<typeof useHousehold> | null>(null);

/** Around the pillars: the household, worked out once for all of them. */
export function AppProvider({ children }: { children: ReactNode }) {
  return <AppContext value={useHousehold()}>{children}</AppContext>;
}

export function useApp() {
  const app = use(AppContext);
  if (!app) throw new Error("useApp() outside AppProvider");
  return app;
}
