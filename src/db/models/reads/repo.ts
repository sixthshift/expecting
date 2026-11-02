import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { orm } from "../../connection/client";
import { itemRead } from "./schema";

export class ReadsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** What `person` has read, item id to when they first opened it. */
  reads(person: string): Record<string, string> {
    const rows = this.db.select().from(itemRead).where(eq(itemRead.personId, person)).all();
    return Object.fromEntries(rows.map((r) => [r.itemId, r.readAt]));
  }

  /** `person` opened an entry at `at`; the first time is kept, so opening it again (or a save sent late) changes nothing. */
  markRead(person: string, itemId: string, at: string): void {
    this.db.insert(itemRead).values({ personId: person, itemId, readAt: at }).onConflictDoNothing().run();
  }
}
