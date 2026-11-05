// The one thing: what Home's top shows on a phone, shown whole with its
// action. Pure, so the order is tested apart from the screen.
//
//   an appointment today: it has a time, and missing it costs the most
//   then something late: a deadline coming up or just missed, or slipped past its best-by
//   then how you are today, until you've said
//   then the next thing to do
//   then the day's read, which is always there
//
// A call to make is above all of it, drawn on its own (`Calls`), as on the
// Journal: it isn't a thing to do and be done with.

import type { ToDo } from "../planner/todo";

export type OneThing = { kind: "appointment"; id: string } | { kind: "task"; toDo: ToDo } | { kind: "checkIn" } | { kind: "read" };

/** Everything that could be the one thing, most pressing first: the first is shown, the second named under it as what's then. */
export function oneThings({
  appointmentToday,
  toDo,
  checkedIn,
}: {
  /** Today's appointment, if there's one still to come. */
  appointmentToday: string | null;
  /** To do now, in its order (`toDoNow`). */
  toDo: readonly ToDo[];
  /** Whether this phone's person has said how they are today. */
  checkedIn: boolean;
}): OneThing[] {
  const list: OneThing[] = [];
  if (appointmentToday) list.push({ kind: "appointment", id: appointmentToday });
  const [first] = toDo;
  const late = first !== undefined && first.why !== "soon";
  if (first && late) list.push({ kind: "task", toDo: first });
  if (!checkedIn) list.push({ kind: "checkIn" });
  if (first && !late) list.push({ kind: "task", toDo: first });
  list.push({ kind: "read" });
  return list;
}

/** The one thing's own key: the same thing keeps its place while it's open, a ticked task gives way to the next. */
export function oneThingKey(thing: OneThing): string {
  return thing.kind === "appointment" ? `appointment:${thing.id}` : thing.kind === "task" ? `task:${thing.toDo.task.id}` : thing.kind;
}
