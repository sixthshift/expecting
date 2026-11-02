import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { appointmentsIn } from "../../../../lib/appointments";
import { AppointmentCard } from "../../../appointments/components/AppointmentCard";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/** A peek's appointments, on that week's days. Now, the next one is with the doing (`NextAppointment`). */
export function AppointmentsThatWeek() {
  const { week, peeking, dueDate } = useThisWeekPage();
  const { data: appointments } = useAppointmentsQuery();
  const thatWeeks = peeking && week !== null ? appointmentsIn(appointments, week, dueDate) : [];
  if (thatWeeks.length === 0) return null;
  return (
    <section aria-labelledby="appointments-that-week" className="flex flex-col gap-2">
      <h2 id="appointments-that-week" className="text-lg font-display font-semibold text-fg-strong">
        Appointments that week
      </h2>
      {thatWeeks.map((a) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
    </section>
  );
}
