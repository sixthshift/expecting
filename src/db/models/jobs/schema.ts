import { sql } from "drizzle-orm";
import { check, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** One of you's answer to a job (JOBS in src/lib/jobs.ts), from where they stand. */
export const jobPick = sqliteTable(
  "job_pick",
  {
    jobId: text("job_id").notNull(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    pick: text("pick", { enum: ["me", "you", "together"] }).notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.jobId, t.personId] }), check("job_pick_pick", sql`${t.pick} IN ('me', 'you', 'together')`)]
);
