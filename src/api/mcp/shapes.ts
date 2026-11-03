// The shapes several pillars' tools answer with: a task, with its window as
// weeks and as days (emails and calendars speak in days), and a Library entry
// as a list shows it.

import type { Item, Task } from "../../content/schema";
import { weekDates, weekStarts } from "../../lib/timeline";
import type { Known } from "./context";

/** A task as Claude reads it: what, whose, its window, and whether it's done. */
export function taskOf(task: Task, k: Known) {
  const due = k.dueDate;
  return {
    id: task.id,
    title: task.title,
    who: task.who,
    opens: task.opens,
    due: task.due,
    deadline: task.deadline,
    ...(due
      ? {
          opensOn: weekStarts(task.opens, due),
          dueBy: weekDates(task.due, due)!.end,
          deadlineOn: task.deadline === null ? null : weekDates(task.deadline, due)!.end,
        }
      : {}),
    entry: task.itemId,
    done: k.ticks[task.id] ?? null,
  };
}

/** An entry as a list shows it. */
export function entryOf(item: Item) {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    topic: item.topic,
    ask: item.ask,
    summary: item.summary,
    weeks: item.from === null ? null : [item.from, item.to],
  };
}
