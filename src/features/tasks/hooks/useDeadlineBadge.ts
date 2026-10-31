import { useEffect } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useNow } from "../../../api/rpc/settings";
import { toDoNow } from "../../../lib/todo";
import { useTasks } from "./useTasks";

/**
 * The app icon's badge, on a phone that has one (an installed app; Safari
 * and Chrome both, where `setAppBadge` exists): how many tasks have a
 * deadline coming up and aren't ticked, the ones that can't wait. Only those:
 * a count of everything open would never be zero, and a badge that never
 * clears is one nobody reads. Cleared while something has happened, and when
 * there are none.
 */
export function useDeadlineBadge(quiet: boolean): void {
  const { data: checklist } = useChecklist();
  const now = useNow();
  const tasks = useTasks();
  const count = quiet || now === null ? 0 : toDoNow(tasks, checklist.ticks, now).filter((t) => t.why === "deadline").length;
  useEffect(() => {
    if (typeof navigator === "undefined" || !("setAppBadge" in navigator)) return;
    const done = count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge();
    // Refused (not installed, or not allowed): no badge, and nothing to say about it.
    done.catch(() => undefined);
  }, [count]);
}
