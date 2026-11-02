import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../routes/root";
import { serveAppointmentIcs } from "../../server/calendar/serve";

/**
 * GET /api/appointments/<id>/calendar.ics: an appointment as a calendar
 * file, for the phone's own calendar. The second server route the app itself
 * calls, on purpose: a phone hands a calendar file to its calendar only when
 * it's opened from a plain URL with its own type, which a server function
 * can't give. Behind the gate like every /api/* path: no session, a 401.
 */
export const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/appointments/$id/calendar.ics",
  server: {
    handlers: {
      GET: ({ params }) => serveAppointmentIcs(params),
    },
  },
});
