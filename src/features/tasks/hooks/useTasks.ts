import { useMemo } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useAnswers } from "../../../api/rpc/facts";
import { useSettings } from "../../../api/rpc/settings";
import { builtInTasks } from "../../../content";
import type { Item, Task } from "../../../content/schema";
import { buildChecklist, type OwnTaskRow } from "../../../lib/checklist";
import type { ISODate } from "../../../lib/dates";
import { factsOf, timeTask } from "../../../lib/facts";
import { useItems } from "../../library/hooks/useItems";
import type { Facts } from "../../settings/model/facts";

/** The checklist for this household: the tasks of the items shown (and those of no item), each timed by its facts, then your own. */
export function tailorTasks(items: readonly Item[], facts: Facts, dueDate: ISODate | null, ownTasks: readonly OwnTaskRow[]): Task[] {
  const shown = new Set(items.map((i) => i.id));
  return buildChecklist(
    builtInTasks.filter((t) => t.itemId === null || shown.has(t.itemId)).map((t) => timeTask(t, facts, dueDate)),
    ownTasks
  );
}

/** The checklist for this household, as its items, answers, due date and own tasks change. */
export function useTasks(): Task[] {
  const items = useItems();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: settings } = useSettings();
  const { data: checklist } = useChecklist();
  return useMemo(() => tailorTasks(items, facts, settings.dueDate, checklist.ownTasks), [items, facts, settings.dueDate, checklist.ownTasks]);
}
