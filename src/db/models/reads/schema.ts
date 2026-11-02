import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** A Library entry one of you has opened, and when first: an item's id, with no foreign key (entries are files). */
export const itemRead = sqliteTable(
  "item_read",
  {
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    readAt: text("read_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.personId, t.itemId] })]
);
