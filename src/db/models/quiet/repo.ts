import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { Quiet, QuietKind } from "../../../lib/quiet";
import { orm } from "../../connection/client";
import { quiet } from "./schema";

const ID = 1;

/** Whether Expecting is quiet, and why. Which kinds may follow which is `lib/quiet`'s rule, not this repo's. */
export class QuietRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** What has happened, or null while nothing has. */
  get(): Quiet | null {
    const row = this.db.select().from(quiet).where(eq(quiet.id, ID)).get();
    return row ? { kind: row.kind, setBy: row.setBy, setAt: row.setAt } : null;
  }

  /** Something has happened: the latest word stands. */
  set(kind: QuietKind, setBy: string | null, now: Date = new Date()): Quiet {
    const row = { kind, setBy, setAt: now.toISOString() };
    this.db
      .insert(quiet)
      .values({ id: ID, ...row })
      .onConflictDoUpdate({ target: quiet.id, set: row })
      .run();
    return row;
  }

  /** Expecting comes back. */
  clear(): void {
    this.db.delete(quiet).where(eq(quiet.id, ID)).run();
  }
}
