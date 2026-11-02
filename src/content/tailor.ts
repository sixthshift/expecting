// What the app shows you of the built-in content: the items your answers fit
// and your extras turn on, and the tasks of those items, timed. Pure, so the
// app's hooks and the server (src/api/mcp/) tailor alike.

import type { Facts } from "../features/settings/model/facts";
import { applies } from "../features/settings/model/facts";
import { buildChecklist, type OwnTaskRow } from "../lib/checklist";
import type { ISODate } from "../lib/dates";
import { inExtras } from "../lib/extras";
import { timeTask } from "../lib/facts";
import { builtInItems, builtInTasks } from "./index";
import type { Item, Task } from "./schema";

/** The items for you: only those your facts fit, and in an extra only once that's on. */
export function tailorItems(facts: Facts, on: ReadonlySet<string>): Item[] {
  return builtInItems.filter((i) => applies(i.when, facts) && inExtras(i.extra, on));
}

/** The checklist: the tasks of the items shown (and those of no item), each timed by its facts, then your own. */
export function tailorTasks(items: readonly Item[], facts: Facts, dueDate: ISODate | null, ownTasks: readonly OwnTaskRow[]): Task[] {
  const shown = new Set(items.map((i) => i.id));
  return buildChecklist(
    builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)).map((t) => timeTask(t, facts, dueDate)),
    ownTasks
  );
}
