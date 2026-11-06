import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { appointment } from "../appointments/schema";
import { person } from "../people/schema";

/** A question for an appointment: open, it waits for that one; asked, it keeps what you were told there. */
export const question = sqliteTable(
  "question",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(),
    answer: text("answer"),
    askedAt: text("asked_at"),
    /** The Library entry it was asked from; an item id, not a foreign key (items are files). */
    itemId: text("item_id"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    /** The appointment it is for, or was asked at; null once that one is deleted, until it is moved to another. */
    appointmentId: text("appointment_id").references(() => appointment.id, { onDelete: "set null" }),
  },
  (t) => [index("question_appointment").on(t.appointmentId)]
);
