import { asc, eq } from "drizzle-orm";
import type { Question } from "../../../lib/planner/questions";
import { Repo } from "../../connection/client";
import { appointment } from "../appointments/schema";
import { question } from "./schema";

export class QuestionsRepo extends Repo {
  /** All questions, oldest first. */
  list(): Question[] {
    return this.db.select().from(question).orderBy(asc(question.createdAt)).all();
  }

  /** Whether the appointment is still kept: one deleted meanwhile (by the other of you, while this phone was offline) takes no questions. */
  private kept(appointmentId: string | null): string | null {
    return appointmentId && this.db.select({ id: appointment.id }).from(appointment).where(eq(appointment.id, appointmentId)).get() ? appointmentId : null;
  }

  /**
   * Add a question, by the id the phone gave it, for an appointment, from the entry it was asked from and by whom; one
   * already here (the same save, sent twice) is left as it is. An appointment no longer kept leaves it for none, to be moved.
   */
  add(
    text: string,
    { itemId = null, by = null, appointmentId = null }: { itemId?: string | null; by?: string | null; appointmentId?: string | null } = {},
    now: Date = new Date(),
    id: string = crypto.randomUUID()
  ): Question {
    const row: Question = { id, text, answer: null, askedAt: null, itemId, by, createdAt: now.toISOString(), appointmentId: this.kept(appointmentId) };
    this.db.insert(question).values(row).onConflictDoNothing().run();
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

  /** For another appointment; one no longer kept leaves it where it was. */
  move(id: string, appointmentId: string): void {
    if (!this.kept(appointmentId)) return;
    this.db.update(question).set({ appointmentId }).where(eq(question.id, id)).run();
  }

  /** Not asked after all: open again, for the same appointment; the answer is kept. */
  reopen(id: string): void {
    this.db.update(question).set({ askedAt: null }).where(eq(question.id, id)).run();
  }

  delete(id: string): void {
    this.db.delete(question).where(eq(question.id, id)).run();
  }
}
