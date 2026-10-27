// The household as every pillar sees it: loaded once by the app route, then
// tailored (only the items and tasks its answers fit) and placed in time.

import { useMemo } from "react";
import { builtInItems, builtInTasks } from "../content";
import { applies } from "../content/profile";
import { buildChecklist } from "../lib/checklist";
import { todayISO } from "../lib/dates";
import { NOT_YET, STAGE } from "../lib/onboarding";
import { positionOn, type Slot, slotKey } from "../lib/timeline";
import { Route as appRoute } from "../routes/app/route";

export function useApp() {
  const { state, questions } = appRoute.useLoaderData();
  const { dueDate, birthDate, profile } = state.household;
  const today = todayISO();
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;
  // Getting ready, with no due date yet: "now" is the getting-ready band.
  const gettingReady = !dueDate && profile[STAGE] === NOT_YET;
  const now: Slot | null = position?.slot ?? (gettingReady ? { phase: "before" } : null);

  // Tailored: an item, and its tasks, only for a household its `when` fits.
  const items = useMemo(() => builtInItems.filter((i) => applies(i.when, profile)), [profile]);
  const tasks = useMemo(() => {
    const shown = new Set(items.map((i) => i.id));
    return buildChecklist(
      builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)),
      state.ownTasks
    );
  }, [items, state.ownTasks]);

  return { state, questions, today, position, gettingReady, now, nowKey: now ? slotKey(now) : null, items, tasks };
}
