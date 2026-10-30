import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { PHOTO_KINDS } from "../../../lib/photos";
import { upload } from "../files/schema";
import { person } from "../people/schema";

/** A bump photo, a scan, or something else, on its day. Shared: either of you can change any. Its week is worked out on read. */
export const photo = sqliteTable(
  "photo",
  {
    id: text("id").primaryKey(),
    /** The upload it shows; one photo each. Deleting the photo deletes it. */
    fileId: text("file_id")
      .notNull()
      .references(() => upload.id),
    /** bump, scan or other. */
    kind: text("kind", { enum: PHOTO_KINDS }).notNull(),
    /** The day it was taken, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** The time, HH:MM, if known. */
    time: text("time"),
    /** A few words, if any. */
    caption: text("caption"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [
    check("photo_kind", sql`${t.kind} IN ('bump', 'scan', 'other')`),
    check("photo_caption", sql`${t.caption} IS NULL OR length(trim(${t.caption})) > 0`),
    uniqueIndex("photo_file").on(t.fileId),
    index("photo_day").on(t.day),
  ]
);
