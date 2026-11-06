import { appointmentsSaves } from "../../../../../api/rpc/appointments";
import { useSave } from "../../../../../app/hooks/useSave";
import { newId } from "../../../../../lib/outbox";
import { AppointmentForm } from "./AppointmentForm";

/** A new appointment, from the "+", the Planner, or a question with none booked. `onAdded`, with its id, once it's kept (the capture sheet closes, the Planner's form folds). `onCancel` to fold it unsaved. */
export function AddAppointment({ onAdded, onCancel }: { onAdded?: (id: string) => void; onCancel?: () => void }) {
  const add = useSave(appointmentsSaves.addAppointment);
  return (
    <AppointmentForm
      submitLabel="Add appointment"
      onCancel={onCancel}
      onSave={({ title, day, time, place, notes }) => {
        const id = newId();
        add({ id, title, day, time, place, notes });
        onAdded?.(id);
      }}
    />
  );
}
