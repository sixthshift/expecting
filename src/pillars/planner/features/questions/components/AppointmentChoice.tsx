import { Select } from "@sixthshift/design-system/select";
import { todayISO } from "../../../../../lib/dates";
import { type Appointment, appointmentName } from "../../../../../lib/planner/appointments";

/** Which appointment a question is for: one of those still ahead, by name ("Midwife, Fri 6 Nov"). */
export function AppointmentChoice({
  ahead,
  value,
  onChange,
  label = "For which appointment",
  placeholder = "Choose an appointment",
}: {
  ahead: readonly Appointment[];
  value: string | undefined;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const today = todayISO();
  const options = ahead.map((a) => ({ value: a.id, label: appointmentName(a, today) }));
  return <Select aria-label={label} options={options} value={value} placeholder={placeholder} onValueChange={onChange} className="w-full max-w-xs" />;
}
