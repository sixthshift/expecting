import { asc, eq } from "drizzle-orm";
import type { Appointment } from "../../../lib/planner/appointments";
import { Repo } from "../../connection/client";
import { appointment } from "./schema";

/** What's said of an appointment, new or changed: blank words are none. */
export type AppointmentInput = { id: string; title: string; day: string; time: string | null; place?: string | null; notes?: string | null };

const words = (s: string | null | undefined) => {
  const t = s?.trim();
  return t ? t : null;
};

export class AppointmentsRepo extends Repo {
  /** Every appointment, earliest first. */
  list(): Appointment[] {
    return this.db.select().from(appointment).orderBy(asc(appointment.day), asc(appointment.time)).all();
  }

  /** Add one, by the id the phone gave it, saying who; one already here (the same save, sent twice) is left as it is. */
  add(input: AppointmentInput, by: string | null, now: Date = new Date()): Appointment {
    const row: Appointment = {
      id: input.id,
      title: input.title.trim(),
      day: input.day,
      time: input.time,
      place: words(input.place),
      notes: words(input.notes),
      by,
      createdAt: now.toISOString(),
      editedBy: null,
      editedAt: null,
    };
    this.db.insert(appointment).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change what it is, when, where or its notes, saying who and when. */
  edit(input: AppointmentInput, by: string | null, now: Date = new Date()): void {
    this.db
      .update(appointment)
      .set({
        title: input.title.trim(),
        day: input.day,
        time: input.time,
        place: words(input.place),
        notes: words(input.notes),
        editedBy: by,
        editedAt: now.toISOString(),
      })
      .where(eq(appointment.id, input.id))
      .run();
  }

  delete(id: string): void {
    this.db.delete(appointment).where(eq(appointment.id, id)).run();
  }
}
