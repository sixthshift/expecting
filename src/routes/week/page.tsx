import { WeekView } from "../../components/WeekView";
import { todayISO } from "../../lib/dates";
import { positionOn } from "../../lib/timeline";
import { Route } from "./route";

/** Any week, read at any time. */
export function WeekPage() {
  const { slot, state } = Route.useLoaderData();
  const today = todayISO();
  const { dueDate, birthDate } = state.household;
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;
  return <WeekView slot={slot} position={position} state={state} today={today} />;
}
