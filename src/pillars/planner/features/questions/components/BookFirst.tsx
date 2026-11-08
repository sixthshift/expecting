import { TitledModal } from "../../../../../components/TitledModal";
import { AddAppointment } from "../../appointments/components/AddAppointment";

/**
 * A question is for an appointment: with none booked, the one it's for is
 * added first, then the question goes to it (`onBooked`, with its id).
 */
export function BookFirst({ question, onBooked, onClose }: { question?: string; onBooked: (appointmentId: string) => void; onClose: () => void }) {
  return (
    <TitledModal title="Which appointment is it for?" align="top" onClose={onClose} className="flex flex-col gap-4">
      <p className="text-sm text-fg-subtle">
        {question ? <>“{question}” waits for an appointment. </> : null}
        Nothing's booked yet: add the next one, and the question goes with it.
      </p>
      <AddAppointment
        onAdded={(id) => {
          onBooked(id);
          onClose();
        }}
        onCancel={onClose}
      />
    </TitledModal>
  );
}
