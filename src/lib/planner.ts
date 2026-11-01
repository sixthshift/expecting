// The Planner's to-do list, shaped so there's always somewhere to start. Pure,
// so the shape is tested apart from the screen.
//
//   next     the one thing to do first: the top of To do now (src/lib/todo.ts)
//   now      the rest of To do now, in its order: the same list This week opens with
//   ahead    everything else still to come, by the week it next asks of you:
//            when it opens, else when it's best done by, else its deadline;
//            then put into stages, each ending at a week people mark, so
//            what's ahead reads as a few goals rather than a list
//   earlier  slipped long ago, deadline and all: left to the end, folded
//   done     ticked
//
// A task ticked during this visit stays where it was until the next one, so a
// tick never makes the row you just touched jump away. Next up is the
// exception: ticking it is how you get to the next one.

import type { Task } from "../content/schema";
import type { Week } from "./timeline";
import { type ToDo, toDoNow } from "./todo";

/** What a week ahead stands for: when the task opens, is best done by, or its deadline. */
type AheadAt = "opens" | "due" | "deadline";

export type Ahead = { task: Task; week: Week; at: AheadAt };

export type Plan = {
  next: ToDo | null;
  now: ToDo[];
  ahead: Ahead[];
  earlier: Task[];
  done: Task[];
  /** How many are ticked, of how many in all. */
  progress: { done: number; total: number };
};

export function planTasks(tasks: readonly Task[], ticks: Record<string, string>, tickedHere: ReadonlySet<string>, now: Week | null): Plan {
  // Ticks from before this visit: what places each task.
  const settled = Object.fromEntries(Object.entries(ticks).filter(([id]) => !tickedHere.has(id)));
  const sorted = [...tasks].sort((a, b) => a.due - b.due || a.title.localeCompare(b.title));
  const done = sorted.filter((t) => settled[t.id]);
  const progress = { done: tasks.filter((t) => ticks[t.id]).length, total: tasks.length };
  const open = sorted.filter((t) => !settled[t.id]);

  // With no due date there's no now: everything open, by its best-by week.
  if (now === null) {
    return { next: null, now: [], ahead: open.map((task) => ({ task, week: task.due, at: "due" })), earlier: [], done, progress };
  }

  const list = toDoNow(tasks, settled, now);
  const first = list.findIndex((t) => !ticks[t.task.id]);
  const next = list[first] ?? null;
  const listed = new Set(list.map((t) => t.task.id));

  const ahead: Ahead[] = [];
  const earlier: Task[] = [];
  for (const task of open) {
    if (listed.has(task.id)) continue;
    if (task.opens > now) ahead.push({ task, week: task.opens, at: "opens" });
    else if (task.due >= now) ahead.push({ task, week: task.due, at: "due" });
    else if (task.deadline !== null && task.deadline >= now) ahead.push({ task, week: task.deadline, at: "deadline" });
    else earlier.push(task);
  }
  ahead.sort((a, b) => a.week - b.week);

  return { next, now: list.filter((_, i) => i !== first), ahead, earlier, done, progress };
}

/** Where the stages end: the weeks people mark, and one more where the admin crowds in. */
export const STAGES: readonly { end: Week; title: string }[] = [
  { end: 13, title: "Before the first trimester ends" },
  { end: 20, title: "By halfway" },
  { end: 27, title: "Before the third trimester" },
  { end: 32, title: "By 32 weeks" },
  { end: 37, title: "By full term" },
  { end: 42, title: "Before the birth" },
];

/** Where the stage at `i` begins: week 1, or the week after the one before it ends. */
const stageStart = (i: number): Week => (i === 0 ? 1 : STAGES[i - 1]!.end + 1);

/** The stage that ends at `end`, if one does: a stage's own address. */
export function stageEnding(end: Week): { start: Week; end: Week; title: string } | null {
  const i = STAGES.findIndex((s) => s.end === end);
  return i < 0 ? null : { ...STAGES[i]!, start: stageStart(i) };
}

export type Stage = {
  /** Its first week: the week after the stage before it ends. */
  start: Week;
  end: Week;
  title: string;
  /** Still to do, by the week each next asks of you. */
  ahead: Ahead[];
  /** Ticked already, from the same weeks. */
  done: Task[];
};

/** The week a task is aimed at: its deadline when that's all that's left of it, else its best-by week. */
const aim = ({ task, week, at }: Ahead): Week => (at === "deadline" ? week : task.due);

/**
 * What's ahead, as stages: each task in the first stage ending on or after the
 * week it's aimed at, with the ticked tasks of the same weeks for progress. A
 * stage with nothing left to do isn't one.
 */
export function stagesAhead(plan: Plan): Stage[] {
  const stages = STAGES.map((s, i) => ({ ...s, start: stageStart(i), ahead: [] as Ahead[], done: [] as Task[] }));
  // The last stage ends at the last week, so every week has one.
  const stageOf = (week: Week) => stages.find((s) => week <= s.end) as Stage;
  for (const entry of plan.ahead) stageOf(aim(entry)).ahead.push(entry);
  const shown = stages.filter((s) => s.ahead.length > 0);
  for (const task of plan.done) {
    const stage = stageOf(task.due);
    if (shown.includes(stage)) stage.done.push(task);
  }
  return shown;
}
