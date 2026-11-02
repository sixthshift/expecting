import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { CalendarPlus, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { appointmentsSaves } from "../../../api/rpc/appointments";
import { useSave } from "../../../app/hooks/useSave";
import { APPOINTMENT_WHEN, type Appointment, appointmentSoon } from "../../../lib/appointments";
import { icsPath } from "../../../lib/calendar";
import { type ISODate, todayISO } from "../../../lib/dates";
import { when } from "../../../lib/labels";
import { AppointmentForm } from "./AppointmentForm";

/**
 * One appointment: what, when (and how soon, within a fortnight), where, and
 * its notes. Either of you can change it or delete it; a delete can be undone.
 * One still ahead can go in the phone's own calendar, for its reminders.
 * `size`: the next one is given room.
 */
export function AppointmentCard({ appointment, size = "sm" }: { appointment: Appointment; size?: "sm" | "md" }) {
  const [editing, setEditing] = useState(false);
  const edit = useSave(appointmentsSaves.editAppointment);
  const remove = useSave(appointmentsSaves.deleteAppointment);
  const add = useSave(appointmentsSaves.addAppointment);
  const today = todayISO();
  const soon = appointmentSoon(appointment, today);

  function deleted() {
    const { id, title, day, time, place, notes } = appointment;
    remove({ id });
    toast({ title: "Appointment deleted", action: "Undo", onAction: () => add({ id, title, day: day as ISODate, time, place, notes }) });
  }

  if (editing) {
    return (
      <Card size={size}>
        <AppointmentForm
          initial={{
            title: appointment.title,
            day: appointment.day as ISODate,
            time: appointment.time,
            place: appointment.place ?? "",
            notes: appointment.notes ?? "",
          }}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSave={({ title, day, time, place, notes }) => {
            edit({ id: appointment.id, title, day, time, place, notes });
            setEditing(false);
          }}
        />
      </Card>
    );
  }

  return (
    <Card size={size}>
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className={size === "md" ? "font-display text-lg font-semibold text-fg-strong" : "font-medium text-fg-strong"}>{appointment.title}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-fg-normal">
            {when(appointment.day, appointment.time, today, APPOINTMENT_WHEN)}
            {soon ? (
              <Badge size="sm" variant="soft" intent={soon === "Today" ? "brand" : "neutral"}>
                {soon}
              </Badge>
            ) : null}
          </p>
          {appointment.place ? (
            <p className="flex items-center gap-1 text-sm text-fg-subtle">
              <MapPin aria-hidden size={14} className="shrink-0" />
              {appointment.place}
            </p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" iconOnly aria-label={`Change "${appointment.title}"`} onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${appointment.title}"`} onClick={deleted}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
      {appointment.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-fg-normal">{appointment.notes}</p> : null}
      {appointment.day >= today ? (
        <a
          href={icsPath(appointment.id)}
          aria-label={`Add "${appointment.title}" to your calendar`}
          className="-mb-2 flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal"
        >
          <CalendarPlus aria-hidden size={16} />
          Add to calendar
        </a>
      ) : null}
    </Card>
  );
}
