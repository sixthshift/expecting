import { Card } from "@sixthshift/design-system/card";
import { AddAppointment } from "../../appointments/components/AddAppointment";

/** Where a question would be added while nothing's booked: a question is for an appointment, so the next one is added first. */
export function NoneBooked({ onBooked }: { onBooked?: (appointmentId: string) => void }) {
  return (
    <Card size="sm" className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">Questions are for an appointment, and none is booked. Add the next one, then what you want to ask there.</p>
      <AddAppointment onAdded={onBooked} />
    </Card>
  );
}
