import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { ISODate } from "../../../lib/dates";
import type { Baby } from "../../../lib/theme";
import { orm } from "../../connection/client";
import { household } from "./schema";

/** The household's settings. Its answers are facts, in their own table (`../facts`). */
export type Household = { dueDate: ISODate | null; baby: Baby; onboardedAt: string | null };

const ID = 1;

export class HouseholdRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** The settings; no due date and the baby unknown before anything is entered. */
  get(): Household {
    const row = this.db.select().from(household).where(eq(household.id, ID)).get();
    return {
      dueDate: (row?.dueDate as ISODate | null) ?? null,
      baby: row?.baby ?? "unknown",
      onboardedAt: row?.onboardedAt ?? null,
    };
  }

  /** Change the fields given; leave the rest. */
  update(changes: Partial<Household>, now: Date = new Date()): Household {
    const next = { ...this.get(), ...changes };
    const values = {
      id: ID,
      dueDate: next.dueDate,
      baby: next.baby,
      onboardedAt: next.onboardedAt,
      updatedAt: now.toISOString(),
    };
    this.db
      .insert(household)
      .values(values)
      .onConflictDoUpdate({
        target: household.id,
        set: {
          dueDate: values.dueDate,
          baby: values.baby,
          onboardedAt: values.onboardedAt,
          updatedAt: values.updatedAt,
        },
      })
      .run();
    return next;
  }
}
