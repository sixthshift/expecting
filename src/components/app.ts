// The household as every pillar sees it: loaded once by the app route, then
// tailored (only the items and tasks its answers fit) and placed in time.

import { useMemo } from "react";
import { builtInItems, builtInTasks } from "../content";
import { applies } from "../content/profile";
import { buildChecklist } from "../lib/checklist";
import { todayISO } from "../lib/dates";
import { stageOf } from "../lib/stage";
import { positionOn, type Slot, slotKey } from "../lib/timeline";
import { Route as appRoute } from "../routes/app/route";

export function useApp() {
  const { state, questions } = appRoute.useLoaderData();
  const { dueDate, birthDate, profile } = state.household;
  const today = todayISO();
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;
  // Which app this is: getting ready, the pregnancy, or the baby's here.
  const stage = stageOf(state.household, today);
  // Getting ready, with no due date yet: "now" is the getting-ready band.
  const now: Slot | null = position?.slot ?? (stage === "preconception" ? { phase: "before" } : null);

  // Tailored: an item, and its tasks, only for a household its `when` fits.
  const items = useMemo(() => builtInItems.filter((i) => applies(i.when, profile)), [profile]);
  const tasks = useMemo(() => {
    const shown = new Set(items.map((i) => i.id));
    return buildChecklist(
      builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)),
      state.ownTasks
    );
  }, [items, state.ownTasks]);

  return { state, questions, today, position, stage, now, nowKey: now ? slotKey(now) : null, items, tasks };
}
