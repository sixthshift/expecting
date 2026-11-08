// Appointments: what, the day, perhaps the time and the place, and notes.
// Shared, and either of you can change one; each says who added it and who
// changed it last. One-off: nothing repeats.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppointmentsRepo } from "../../db/models/appointments/repo";
import { isISODate, TIME } from "../../lib/dates";
import { save, stamped } from "../../lib/outbox";
import type { Appointment } from "../../lib/planner/appointments";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const appointment = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    day: z.string().refine(isISODate, "Not a date"),
    time: z.string().regex(TIME).nullable(),
    place: z.string().max(500).nullable(),
    notes: z.string().max(10_000).nullable(),
  })
  .strict();

/** What a phone sends for an appointment, new or changed. */
export type AppointmentInput = z.infer<typeof appointment>;

const listAppointments = createServerFn({ method: "GET" }).handler(() => new AppointmentsRepo(getDb()).list());

const addAppointment = createServerFn({ method: "POST" })
  .validator(appointment)
  .handler(({ data }) => new AppointmentsRepo(getDb()).add(data, personId(), madeAt()));

const editAppointment = createServerFn({ method: "POST" })
  .validator(appointment)
  .handler(({ data }) => new AppointmentsRepo(getDb()).edit(data, personId(), madeAt()));

const deleteAppointment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new AppointmentsRepo(getDb()).delete(data.id));

export type Appointments = Awaited<ReturnType<typeof listAppointments>>;
export const appointmentsQuery = queryOptions({ queryKey: ["appointments"], queryFn: () => listAppointments() });

/** Blank words are none, as the server keeps them. */
const words = (s: string | null) => (s?.trim() ? s.trim() : null);

/** The appointments' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const appointmentsSaves = {
  addAppointment: save({
    key: "addAppointment",
    query: appointmentsQuery.queryKey,
    send: (data: AppointmentInput, made) => addAppointment({ data, headers: stamped(made) }),
    apply: (appointments: Appointments, input, made): Appointments =>
      appointments.some((a) => a.id === input.id)
        ? appointments
        : [
            ...appointments,
            {
              ...input,
              title: input.title.trim(),
              place: words(input.place),
              notes: words(input.notes),
              by: made.by,
              createdAt: made.at,
              editedBy: null,
              editedAt: null,
            } satisfies Appointment,
          ],
  }),
  editAppointment: save({
    key: "editAppointment",
    query: appointmentsQuery.queryKey,
    send: (data: AppointmentInput, made) => editAppointment({ data, headers: stamped(made) }),
    apply: (appointments: Appointments, input, made): Appointments =>
      appointments.map((a) =>
        a.id === input.id
          ? { ...a, ...input, title: input.title.trim(), place: words(input.place), notes: words(input.notes), editedBy: made.by, editedAt: made.at }
          : a
      ),
  }),
  deleteAppointment: save({
    key: "deleteAppointment",
    query: appointmentsQuery.queryKey,
    send: (data: { id: string }, made) => deleteAppointment({ data, headers: stamped(made) }),
    apply: (appointments: Appointments, { id }) => appointments.filter((a) => a.id !== id),
  }),
};

export const useAppointmentsQuery = queryHook(appointmentsQuery);
