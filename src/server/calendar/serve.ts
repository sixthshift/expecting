// An appointment's calendar file, answered for GET
// /api/appointments/<id>/calendar.ics (src/api/rest/calendar.ts), behind the
// gate like every /api/* path.

import type { Database } from "bun:sqlite";
import { AppointmentsRepo } from "../../db/models/appointments/repo";
import { icsName, icsOf } from "../../lib/calendar";
import { getDb } from "../core/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The file, inline: an iPhone shows the event with Add to Calendar, a desktop
 * browser downloads it for its calendar app. Never kept: an appointment
 * changes. One not here (deleted, or added offline and not sent yet) is a 404
 * that says so.
 */
export function serveAppointmentIcs(params: { id: string }, db: Database = getDb(), now: Date = new Date()): Response {
  const appointment = UUID.test(params.id) ? new AppointmentsRepo(db).list().find((a) => a.id === params.id) : undefined;
  if (!appointment) {
    return new Response("No such appointment here. One added without signal is here once your phone has sent it.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const name = icsName(appointment);
  return new Response(icsOf(appointment, now), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `inline; filename="${name}"`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
