import type { Database } from "bun:sqlite";
import { asc, eq } from "drizzle-orm";
import { orm } from "../../connection/client";
import { question } from "./schema";

export type Question = { id: string; text: string; answer: string | null; askedAt: string | null; createdAt: string };

export class QuestionsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** All questions, oldest first. */
  list(): Question[] {
    return this.db.select().from(question).orderBy(asc(question.createdAt)).all();
  }

  add(text: string, now: Date = new Date()): Question {
    const row: Question = { id: crypto.randomUUID(), text, answer: null, askedAt: null, createdAt: now.toISOString() };
    this.db.insert(question).values(row).run();
    return row;
  }

  /** Mark asked, with what we were told. An empty answer is stored as null. */
  markAsked(id: string, answer: string, now: Date = new Date()): void {
    const trimmed = answer.trim();
    this.db
      .update(question)
      .set({ askedAt: now.toISOString(), answer: trimmed.length > 0 ? trimmed : null })
      .where(eq(question.id, id))
      .run();
  }

  /** Back on the list for next time; the answer is kept. */
  reopen(id: string): void {
    this.db.update(question).set({ askedAt: null }).where(eq(question.id, id)).run();
  }

  delete(id: string): void {
    this.db.delete(question).where(eq(question.id, id)).run();
  }
}
