import { getRouteApi } from "@tanstack/react-router";
// The household as every pillar sees it: loaded once by the app route, then
// tailored (only the items and tasks its facts fit, each task timed by them)
// and placed in time.

import { useMemo } from "react";
import { builtInItems, builtInTasks } from "../../content";
import { applies } from "../../content/facts";
import { buildChecklist } from "../../lib/checklist";
import { todayISO } from "../../lib/dates";
import { factsOf, timeTask } from "../../lib/facts";
import { positionOn } from "../../lib/timeline";

const route = getRouteApi("/app");

export function useApp() {
  const { state, questions } = route.useLoaderData();
  const { dueDate } = state.household;
  const facts = useMemo(() => factsOf(state.answers), [state.answers]);
  const today = todayISO();
  const position = dueDate ? positionOn(today, dueDate) : null;
  // This week; null until there's a due date.
  const now = position?.week ?? null;

  // Tailored: an item, and its tasks, only for a household its `when` fits.
  const items = useMemo(() => builtInItems.filter((i) => applies(i.when, facts)), [facts]);
  const tasks = useMemo(() => {
    const shown = new Set(items.map((i) => i.id));
    return buildChecklist(
      builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)).map((t) => timeTask(t, facts, dueDate)),
      state.ownTasks
    );
  }, [items, facts, dueDate, state.ownTasks]);

  return { state, questions, today, position, now, facts, items, tasks };
}
