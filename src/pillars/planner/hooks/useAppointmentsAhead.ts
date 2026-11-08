import { useMemo } from "react";
import { useAppointmentsQuery } from "../../../api/rpc/appointments";
import { todayISO } from "../../../lib/dates";
import { type Appointment, splitAppointments } from "../../../lib/planner/appointments";

/** The appointments: all still ahead (`ahead`, soonest first), the next of them (today's counts) and the rest, and those gone, latest first. */
export type AppointmentsAhead = { ahead: Appointment[]; next: Appointment | null; later: Appointment[]; past: Appointment[] };

/**
 * The appointments split, for their own part and for the questions' heading,
 * which both of the Planner's worlds draw: worked out from the query, so it
 * reads neither world's context.
 */
export function useAppointmentsAhead(): AppointmentsAhead {
  const { data: all } = useAppointmentsQuery();
  const today = todayISO();
  return useMemo(() => {
    const { ahead, past } = splitAppointments(all, today);
    const [next = null, ...later] = ahead;
    return { ahead, next, later, past };
  }, [all, today]);
}
