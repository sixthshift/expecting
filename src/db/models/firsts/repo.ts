import type { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import { type FirstMark, isFirstKey } from "../../../lib/firsts";
import { orm } from "../../connection/client";
import { firstMark, firstWords } from "./schema";

export class FirstsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every first marked or put aside, each with its words. */
  list(): FirstMark[] {
    const words = this.db.select().from(firstWords).all();
    return this.db
      .select()
      .from(firstMark)
      .all()
      .flatMap((m) =>
        isFirstKey(m.key) ? [{ ...m, key: m.key, words: words.filter((w) => w.key === m.key).map(({ by, body, editedAt }) => ({ by, body, editedAt })) }] : []
      );
  }

  /** Mark a first on its day, or move it; one put aside is marked after all. */
  mark(key: string, day: string, by: string | null, now: Date = new Date()): void {
    this.db.insert(firstMark).values({ key, day, by, createdAt: now.toISOString() }).onConflictDoUpdate({ target: firstMark.key, set: { day } }).run();
  }

  /** Put a suggested first aside, not to be asked again; one already marked is left marked. */
  setAside(key: string, by: string | null, now: Date = new Date()): void {
    this.db.insert(firstMark).values({ key, day: null, by, createdAt: now.toISOString() }).onConflictDoNothing().run();
  }

  /** Take a first back off, words and all: it can be suggested again. */
  unmark(key: string): void {
    this.db.delete(firstMark).where(eq(firstMark.key, key)).run();
  }

  /** One of you's words for a marked first; empty takes them away. */
  setWords(key: string, by: string, body: string, now: Date = new Date()): void {
    const mark = this.db.select().from(firstMark).where(eq(firstMark.key, key)).get();
    if (!mark?.day) throw new Error(`${key} isn't marked`);
    const words = body.trim();
    if (!words) {
      this.db
        .delete(firstWords)
        .where(and(eq(firstWords.key, key), eq(firstWords.by, by)))
        .run();
      return;
    }
    this.db
      .insert(firstWords)
      .values({ key, by, body: words, editedAt: now.toISOString() })
      .onConflictDoUpdate({ target: [firstWords.key, firstWords.by], set: { body: words, editedAt: now.toISOString() } })
      .run();
  }
}
