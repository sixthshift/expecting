import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { ISODate } from "../../../lib/dates";
import type { Baby } from "../../../lib/theme";
import { orm } from "../../connection/client";
import { settings } from "./schema";

/** The settings: the due date, the baby's colours, when onboarding finished. The answers are facts, in their own table (`../facts`). */
export type Settings = { dueDate: ISODate | null; baby: Baby; onboardedAt: string | null };

const ID = 1;

export class SettingsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** The settings; no due date and the baby unknown before anything is entered. */
  get(): Settings {
    const row = this.db.select().from(settings).where(eq(settings.id, ID)).get();
    return {
      dueDate: (row?.dueDate as ISODate | null) ?? null,
      baby: row?.baby ?? "unknown",
      onboardedAt: row?.onboardedAt ?? null,
    };
  }

  /** Change the fields given; leave the rest. */
  update(changes: Partial<Settings>, now: Date = new Date()): Settings {
    const next = { ...this.get(), ...changes };
    const values = {
      id: ID,
      dueDate: next.dueDate,
      baby: next.baby,
      onboardedAt: next.onboardedAt,
      updatedAt: now.toISOString(),
    };
    this.db
      .insert(settings)
      .values(values)
      .onConflictDoUpdate({
        target: settings.id,
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
