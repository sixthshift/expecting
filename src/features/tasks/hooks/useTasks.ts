import { useMemo } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useAnswers } from "../../../api/rpc/facts";
import { useSettings } from "../../../api/rpc/settings";
import type { Task } from "../../../content/schema";
import { tailorTasks } from "../../../content/tailor";
import { factsOf } from "../../../lib/facts";
import { useItems } from "../../library/hooks/useItems";

/** The checklist, as the items, answers, due date and own tasks change. */
export function useTasks(): Task[] {
  const items = useItems();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: settings } = useSettings();
  const { data: checklist } = useChecklist();
  return useMemo(() => tailorTasks(items, facts, settings.dueDate, checklist.ownTasks), [items, facts, settings.dueDate, checklist.ownTasks]);
}
