import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { ISODate } from "../../../lib/dates";
import type { Baby } from "../../../lib/theme";
import { orm } from "../../connection/client";
import { household } from "./schema";

/** `profile` is question id to answer id; which questions exist is content's business, not this repo's. */
export type Household = { dueDate: ISODate | null; birthDate: ISODate | null; baby: Baby; profile: Record<string, string>; onboardedAt: string | null };

const ID = 1;

export class HouseholdRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** The settings; both dates null and the baby unknown before anything is entered. */
  get(): Household {
    const row = this.db.select().from(household).where(eq(household.id, ID)).get();
    return {
      dueDate: (row?.dueDate as ISODate | null) ?? null,
      birthDate: (row?.birthDate as ISODate | null) ?? null,
      baby: row?.baby ?? "unknown",
      profile: row?.profile ?? {},
      onboardedAt: row?.onboardedAt ?? null,
    };
  }

  /** Set one answer, or clear it with null; the other answers stay. */
  answer(question: string, answer: string | null, now: Date = new Date()): Household {
    const profile = { ...this.get().profile };
    if (answer === null) delete profile[question];
    else profile[question] = answer;
    return this.update({ profile }, now);
  }

  /** Change the fields given; leave the rest. */
  update(changes: Partial<Household>, now: Date = new Date()): Household {
    const next = { ...this.get(), ...changes };
    const values = {
      id: ID,
      dueDate: next.dueDate,
      birthDate: next.birthDate,
      baby: next.baby,
      profile: next.profile,
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
          birthDate: values.birthDate,
          baby: values.baby,
          profile: values.profile,
          onboardedAt: values.onboardedAt,
          updatedAt: values.updatedAt,
        },
      })
      .run();
    return next;
  }
}
