import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddAppointment } from "../../../appointments/components/AddAppointment";
import { AppointmentCard } from "../../../appointments/components/AppointmentCard";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { Fold } from "../Fold";

/**
 * The appointments: the next given room, then the rest still ahead, a way to
 * add one, and those gone folded away. Kept while something has happened:
 * there are more appointments then, not fewer.
 */
export function Appointments() {
  const { appointments } = usePlannerPage();
  const { next, later, past } = appointments;
  const [adding, setAdding] = useState(false);
  return (
    <section id="appointments" aria-labelledby="appointments-heading" className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="appointments-heading" className="text-lg font-display font-semibold text-fg-strong">
          Appointments
        </h2>
        {adding ? null : (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus aria-hidden size={16} />
            Add appointment
          </Button>
        )}
      </div>
      {adding ? (
        <Card size="sm">
          <AddAppointment onAdded={() => setAdding(false)} onCancel={() => setAdding(false)} />
        </Card>
      ) : null}
      {next ? (
        <AppointmentCard appointment={next} size="md" />
      ) : adding ? null : (
        <p className="text-sm text-fg-subtle">None coming up. Add one once it's booked.</p>
      )}
      {later.map((a) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
      {past.length > 0 ? (
        <Fold title="Been" count={past.length} folded>
          <div className="flex flex-col gap-3">
            {past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </Fold>
      ) : null}
    </section>
  );
}
