import type { Database } from "bun:sqlite";
import { and, asc, eq } from "drizzle-orm";
import type { Card, Mark } from "../../../lib/bingo";
import type { ISODate } from "../../../lib/dates";
import { orm } from "../../connection/client";
import { bingoCard, bingoMark } from "./schema";

export class BingoRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every card dealt, each with its marks: both of you see both. */
  cards(): Card[] {
    const marks = this.db.select().from(bingoMark).orderBy(asc(bingoMark.markedAt)).all();
    return this.db
      .select()
      .from(bingoCard)
      .orderBy(asc(bingoCard.dealtAt))
      .all()
      .map((c) => ({
        personId: c.personId,
        squares: c.squares,
        dealtAt: c.dealtAt,
        marks: marks
          .filter((m) => m.personId === c.personId)
          .map((m): Mark => ({ squareId: m.squareId, day: m.day as ISODate, note: m.note, markedAt: m.markedAt })),
      }));
  }

  card(personId: string): Card | undefined {
    return this.cards().find((c) => c.personId === personId);
  }

  /** Deal someone a card, or deal again while nothing on it is marked; once something is, the card stays. Returns whether it was dealt. */
  deal(personId: string, squares: string[], now: Date = new Date()): boolean {
    const dealt = this.card(personId);
    if (dealt && dealt.marks.length > 0) return false;
    const row = { personId, squares, dealtAt: now.toISOString() };
    this.db
      .insert(bingoCard)
      .values(row)
      .onConflictDoUpdate({ target: bingoCard.personId, set: { squares, dealtAt: row.dealtAt } })
      .run();
    return true;
  }

  /** Mark a square on someone's card, or change its day and words; one not on their card is left alone. */
  mark(personId: string, squareId: string, { day, note }: { day: ISODate; note: string | null }, now: Date = new Date()): void {
    if (!this.card(personId)?.squares.includes(squareId)) return;
    const words = note?.trim() || null;
    this.db
      .insert(bingoMark)
      .values({ personId, squareId, day, note: words, markedAt: now.toISOString() })
      .onConflictDoUpdate({ target: [bingoMark.personId, bingoMark.squareId], set: { day, note: words } })
      .run();
  }

  unmark(personId: string, squareId: string): void {
    this.db
      .delete(bingoMark)
      .where(and(eq(bingoMark.personId, personId), eq(bingoMark.squareId, squareId)))
      .run();
  }
}
