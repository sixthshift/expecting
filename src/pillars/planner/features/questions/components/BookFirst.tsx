import { Modal } from "@sixthshift/design-system/modal";
import { AddAppointment } from "../../appointments/components/AddAppointment";

/**
 * A question is for an appointment: with none booked, the one it's for is
 * added first, then the question goes to it (`onBooked`, with its id).
 */
export function BookFirst({ question, onBooked, onClose }: { question?: string; onBooked: (appointmentId: string) => void; onClose: () => void }) {
  return (
    <Modal size="sm" align="top" closable onOpenChange={(o) => (o ? null : onClose())} aria-label="Which appointment is it for?">
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">Which appointment is it for?</h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 px-6 pb-6">
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
      </Modal.Body>
    </Modal>
  );
}
