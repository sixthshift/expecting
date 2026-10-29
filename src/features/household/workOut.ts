// The household worked out: its facts and extras, the items and tasks they fit
// (each task timed by them) and where today falls in the pregnancy. A pure
// function of the household query (load.ts) and the day. The query cache is
// the only state: a component reads it and, if it needs any of this, works it
// out itself, memoised on the query's data:
//
//   const { data: state } = useSuspenseQuery(householdQuery);
//   const today = todayISO();
//   const { now, items } = useMemo(() => workOut(state, today), [state, today]);
//
// About a tenth of a millisecond, so each caller doing its own costs nothing.

import { builtInItems, builtInTasks } from "../../content";
import { buildChecklist } from "../../lib/checklist";
import type { ISODate } from "../../lib/dates";
import { extrasOn, inExtras } from "../../lib/extras";
import { factsOf, timeTask } from "../../lib/facts";
import { positionOn } from "../../lib/timeline";
import { applies } from "../settings/model/facts";
import type { HouseholdState } from "./load";

export function workOut(state: HouseholdState, today: ISODate) {
  const { dueDate } = state.household;
  const facts = factsOf(state.answers);
  const position = dueDate ? positionOn(today, dueDate) : null;
  // This week; null until there's a due date.
  const now = position?.week ?? null;

  // Tailored: an item, and its tasks, only for a household its `when` fits, and in an extra only once that's on.
  const extras = extrasOn(state.extras);
  const items = builtInItems.filter((i) => applies(i.when, facts) && inExtras(i.extra, extras));
  const shown = new Set(items.map((i) => i.id));
  const tasks = buildChecklist(
    builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)).map((t) => timeTask(t, facts, dueDate)),
    state.ownTasks
  );

  return { position, now, facts, extras, items, tasks };
}
