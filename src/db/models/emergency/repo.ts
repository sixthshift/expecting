import type { Database } from "bun:sqlite";
import { desc, eq } from "drizzle-orm";
import type { EmergencyInfo } from "../../../lib/emergency";
import { orm } from "../../connection/client";
import { emergencyField } from "./schema";

export class EmergencyRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every filled-in field, and who changed the page last. */
  get(): EmergencyInfo {
    const rows = this.db.select().from(emergencyField).orderBy(desc(emergencyField.changedAt)).all();
    const last = rows[0];
    return {
      values: Object.fromEntries(rows.map((r) => [r.field, r.value])),
      changed: last ? { by: last.changedBy, at: last.changedAt } : null,
    };
  }

  /** Save the fields given; an empty one is cleared. Fields not given, and ones unchanged, are left as they are. */
  set(values: Record<string, string>, changedBy: string | null, now: Date = new Date()): void {
    const changedAt = now.toISOString();
    this.db.transaction((tx) => {
      for (const [field, value] of Object.entries(values)) {
        const current = tx.select({ value: emergencyField.value }).from(emergencyField).where(eq(emergencyField.field, field)).get();
        if ((current?.value ?? "") === value) continue;
        if (value === "") tx.delete(emergencyField).where(eq(emergencyField.field, field)).run();
        else
          tx.insert(emergencyField)
            .values({ field, value, changedBy, changedAt })
            .onConflictDoUpdate({ target: emergencyField.field, set: { value, changedBy, changedAt } })
            .run();
      }
    });
  }
}
