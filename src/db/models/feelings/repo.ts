import type { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import type { Feeling, OwnFeeling, Step, Word } from "../../../lib/feelings";
import { orm } from "../../connection/client";
import { feeling } from "./schema";

export type NewFeeling = { id: string; day: string; time: string | null; step: Step; words: Word[]; note: string | null };

/** A note as kept: trimmed, and nothing at all rather than blank. */
function noteOf(note: string | null): string | null {
  return note?.trim() || null;
}

export class FeelingsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every feeling, as `asker` may see it: their own whole, the other's step only. */
  list(asker: string | null): (Feeling | OwnFeeling)[] {
    return this.db
      .select()
      .from(feeling)
      .all()
      .map(({ words, note, ...shared }) => (shared.by === asker ? { ...shared, words, note } : shared));
  }

  /** Add a feeling, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  add(f: NewFeeling, by: string, now: Date = new Date()): OwnFeeling {
    const row: OwnFeeling = { ...f, note: noteOf(f.note), by, createdAt: now.toISOString() };
    this.db.insert(feeling).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change a feeling, only if it's `by`'s own. Whether it was. */
  change(f: NewFeeling, by: string): boolean {
    const changed = this.db
      .update(feeling)
      .set({ day: f.day, time: f.time, step: f.step, words: f.words, note: noteOf(f.note) })
      .where(and(eq(feeling.id, f.id), eq(feeling.by, by)))
      .returning({ id: feeling.id })
      .get();
    return changed !== undefined;
  }

  /** Delete a feeling, only if it's `by`'s own. */
  delete(id: string, by: string): void {
    this.db
      .delete(feeling)
      .where(and(eq(feeling.id, id), eq(feeling.by, by)))
      .run();
  }
}
