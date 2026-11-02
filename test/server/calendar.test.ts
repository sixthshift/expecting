import { expect, test } from "vitest";
import { AppointmentsRepo } from "../../src/db/models/appointments/repo";
import { serveAppointmentIcs } from "../../src/server/calendar/serve";
import { useTestDb } from "../db/helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";

test("an appointment's calendar file, inline as text/calendar, never kept", async () => {
  new AppointmentsRepo(db()).add({ id: ID, title: "20-week scan", day: "2026-11-20", time: "09:15" }, null);
  const response = serveAppointmentIcs({ id: ID }, db(), new Date("2026-11-02T04:00:00Z"));
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
  expect(response.headers.get("content-disposition")).toBe('inline; filename="20-week-scan.ics"');
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).toContain("SUMMARY:20-week scan\r\n");
});

test("one not here, or not an id, is a 404", () => {
  expect(serveAppointmentIcs({ id: ID }, db()).status).toBe(404);
  expect(serveAppointmentIcs({ id: "../etc" }, db()).status).toBe(404);
});
