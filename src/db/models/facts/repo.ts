import type { Database } from "bun:sqlite";
import { asc, sql } from "drizzle-orm";
import type { Answer } from "../../../lib/facts";
import { orm } from "../../connection/client";
import { answer } from "./schema";

/** Which questions exist, and which answers fit them, is content's business, not this repo's. */
export class FactsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** The latest answer for each question and subject, skipped and cleared ones too. */
  latest(): Answer[] {
    const rows = this.db
      .select({ question: answer.question, about: answer.about, value: answer.value, answeredBy: answer.answeredBy, answeredAt: answer.answeredAt })
      .from(answer)
      .orderBy(asc(answer.answeredAt), asc(sql`rowid`))
      .all();
    const latest = new Map<string, Answer>();
    for (const r of rows) latest.set(`${r.question}\u0000${r.about}`, r);
    return [...latest.values()];
  }

  /** Answer, skip (null) or clear (null): a new row each time, so the history stays. */
  answer(a: Omit<Answer, "answeredAt">, now: Date = new Date()): Answer {
    const row = { ...a, answeredAt: now.toISOString() };
    this.db
      .insert(answer)
      .values({ id: crypto.randomUUID(), ...row })
      .run();
    return row;
  }
}
