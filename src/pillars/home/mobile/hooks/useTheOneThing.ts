import { useState } from "react";
import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { useFeelingsQuery } from "../../../../api/rpc/feelings";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { type OneThing, oneThingKey, oneThings } from "../../../../lib/home/oneThing";
import { isOwn, latestOn } from "../../../../lib/journal/feelings";
import { appointmentSoon, nextAppointment } from "../../../../lib/planner/appointments";
import { toDoNow } from "../../../../lib/planner/todo";
import { useTasks } from "../../../planner/features/tasks/hooks/useTasks";
import { useHomePage } from "../../contexts/HomePageContext";

/**
 * The one thing Home's top shows on a phone, and what's then (`oneThings`).
 * Whatever it shows keeps its place while you're at it: the check-in, once
 * answered, stays while you add words to it, until you leave; a task ticked
 * gives way to the next. Null until there's a now.
 */
export function useTheOneThing(): { thing: OneThing; after: OneThing | undefined } | null {
  const { now, today } = useHomePage();
  const { data: appointments } = useAppointmentsQuery();
  const { data: checklist } = useChecklistQuery();
  const { data: people } = usePeopleQuery();
  const { data: feelings } = useFeelingsQuery();
  const tasks = useTasks();
  const [kept, setKept] = useState<string | null>(null);
  if (now === null) return null;
  const next = nextAppointment(appointments, today);
  const me = people.me;
  const things = oneThings({
    appointmentToday: next && appointmentSoon(next, today) === "Today" ? next.id : null,
    toDo: toDoNow(tasks, checklist.ticks, now),
    // Nobody to ask on a phone that hasn't said who's holding it.
    checkedIn: !me || latestOn(feelings.filter(isOwn), me.id, today) !== undefined,
  });
  const keptThing: OneThing | undefined = kept === "checkIn" ? { kind: "checkIn" } : things.find((t) => oneThingKey(t) === kept);
  const thing = keptThing ?? things[0];
  if (!thing) return null;
  const key = oneThingKey(thing);
  // Kept from one render to the next (React's way to store what was shown).
  if (kept !== key) setKept(key);
  return { thing, after: things.find((t) => oneThingKey(t) !== key) };
}
