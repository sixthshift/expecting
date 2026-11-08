import { and, eq } from "drizzle-orm";
import { type FirstMark, isFirstKey } from "../../../lib/journal/firsts";
import { Repo } from "../../connection/client";
import { firstMark, firstWords } from "./schema";

export class FirstsRepo extends Repo {
  /** Every first marked, each with its words. */
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

  /** Mark a first on its day, or move it. */
  mark(key: string, day: string, by: string | null, now: Date = new Date()): void {
    this.db.insert(firstMark).values({ key, day, by, createdAt: now.toISOString() }).onConflictDoUpdate({ target: firstMark.key, set: { day } }).run();
  }

  /** Take a first back off, words and all: it can be suggested again. */
  unmark(key: string): void {
    this.db.delete(firstMark).where(eq(firstMark.key, key)).run();
  }

  /** One of you's words for a marked first; empty takes them away. */
  setWords(key: string, by: string, body: string, now: Date = new Date()): void {
    const mark = this.db.select().from(firstMark).where(eq(firstMark.key, key)).get();
    if (!mark) throw new Error(`${key} isn't marked`);
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
