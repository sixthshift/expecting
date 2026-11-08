import { AppointmentCard } from "../../features/appointments/components/AppointmentCard";
import { useAdding } from "../../features/appointments/hooks/useAdding";
import { useAppointmentsAhead } from "../../hooks/useAppointmentsAhead";
import { Fold } from "../Fold";

/**
 * The appointments: the next given room, then the rest still ahead, a way to
 * add one, and those gone folded away. Kept while something has happened:
 * there are more appointments then, not fewer. `quietHeading` keeps its
 * heading for a screen reader only, on a page that's already called it.
 */
export function Appointments({ quietHeading = false }: { quietHeading?: boolean }) {
  const { next, later } = useAppointmentsAhead();
  const { adding, button, form } = useAdding();
  return (
    <section id="appointments" aria-labelledby="appointments-heading" className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="appointments-heading" className={quietHeading ? "sr-only" : "text-lg font-display font-semibold text-fg-strong"}>
          Appointments
        </h2>
        {button}
      </div>
      {form}
      {next ? (
        <AppointmentCard appointment={next} size="md" />
      ) : adding ? null : (
        <p className="text-sm text-fg-subtle">None coming up. Add one once it's booked.</p>
      )}
      {later.map((a) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
      <Been title="Been" />
    </section>
  );
}

/** The appointments gone by, latest first, folded away under `title`; nothing while there are none. */
export function Been({ title }: { title: string }) {
  const { past } = useAppointmentsAhead();
  if (past.length === 0) return null;
  return (
    <Fold title={title} count={past.length} folded>
      <div className="flex flex-col gap-3">
        {past.map((a) => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}
      </div>
    </Fold>
  );
}
