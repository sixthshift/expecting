import { useMemo } from "react";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { useSettingsQuery } from "../../../api/rpc/settings";
import type { Task } from "../../../content/schema";
import { tailorTasks } from "../../../content/tailor";
import { factsOf } from "../../../lib/facts";
import { useItems } from "../../library/hooks/useItems";

/** The checklist, as the items, answers, due date and own tasks change. */
export function useTasks(): Task[] {
  const items = useItems();
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: settings } = useSettingsQuery();
  const { data: checklist } = useChecklistQuery();
  return useMemo(() => tailorTasks(items, facts, settings.dueDate, checklist.ownTasks), [items, facts, settings.dueDate, checklist.ownTasks]);
}
