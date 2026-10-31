import type { Database } from "bun:sqlite";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import type { Ending, ItsTime, Start, Waters } from "../../../lib/itsTime";
import { orm } from "../../connection/client";
import { contraction, labourStart, startLine, startTick } from "./schema";

/**
 * It's time's starts, their contractions and ticks, and your own last things.
 * Everything but `delete` acts on the start under way, so a tap from the
 * other phone (or one sent late by the outbox) lands on the same one; with
 * none under way, it does nothing.
 */
export class ItsTimeRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every start, newest first, with its contractions (oldest first) and ticks; and your own last things. */
  get(): ItsTime {
    const contractions = this.db.select().from(contraction).orderBy(asc(contraction.startedAt)).all();
    const ticks = this.db.select().from(startTick).all();
    const starts = this.db
      .select()
      .from(labourStart)
      .orderBy(desc(labourStart.startedAt))
      .all()
      .map(
        (s): Start => ({
          ...s,
          contractions: contractions.filter((c) => c.startId === s.id).map(({ startId: _, ...c }) => c),
          ticks: ticks.filter((t) => t.startId === s.id).map((t) => t.key),
        })
      );
    const lines = this.db.select().from(startLine).orderBy(asc(startLine.createdAt)).all();
    return { starts, lines };
  }

  private open() {
    return this.db.select().from(labourStart).where(isNull(labourStart.endedAt)).get();
  }

  /** Open a start, with the waters broken or not, unless one is under way: then it's that one, with the waters added if they're new. */
  begin(id: string, waters: boolean, by: string | null, now: Date = new Date()): void {
    const at = now.toISOString();
    if (this.db.select().from(labourStart).where(eq(labourStart.id, id)).get()) return;
    if (this.open()) {
      if (waters) this.setWaters(null, now);
      return;
    }
    this.db
      .insert(labourStart)
      .values({ id, startedAt: at, by, watersAt: waters ? at : null })
      .run();
  }

  /** The waters, on the start under way: the first time they broke is kept; the colour (null, not said yet) can change, and isn't lost by saying nothing. */
  setWaters(waters: Waters | null, now: Date = new Date()): void {
    const open = this.open();
    if (!open) return;
    this.db
      .update(labourStart)
      .set({ waters: waters ?? open.waters, watersAt: open.watersAt ?? now.toISOString() })
      .where(eq(labourStart.id, open.id))
      .run();
  }

  /** You've set off: the first time is kept. */
  leave(now: Date = new Date()): void {
    const open = this.open();
    if (!open || open.leftAt) return;
    this.db.update(labourStart).set({ leftAt: now.toISOString() }).where(eq(labourStart.id, open.id)).run();
  }

  /** The start under way is over: we're there, or home again. */
  end(ended: Ending, now: Date = new Date()): void {
    const open = this.open();
    if (!open) return;
    this.db.update(labourStart).set({ ended, endedAt: now.toISOString() }).where(eq(labourStart.id, open.id)).run();
    // A contraction still being timed ends with it.
    this.db
      .update(contraction)
      .set({ endedAt: now.toISOString() })
      .where(and(eq(contraction.startId, open.id), isNull(contraction.endedAt)))
      .run();
  }

  /** Take a start back off, contractions and all: from the Journal, or a false alarm you'd rather not keep. */
  delete(id: string): void {
    this.db.delete(labourStart).where(eq(labourStart.id, id)).run();
  }

  /** One begins: on the start under way; one still going is ended first. */
  beginContraction(id: string, by: string | null, now: Date = new Date()): void {
    const open = this.open();
    if (!open || this.db.select().from(contraction).where(eq(contraction.id, id)).get()) return;
    const at = now.toISOString();
    this.db
      .update(contraction)
      .set({ endedAt: at })
      .where(and(eq(contraction.startId, open.id), isNull(contraction.endedAt)))
      .run();
    this.db.insert(contraction).values({ id, startId: open.id, startedAt: at, by }).run();
  }

  /** One ends: the first end tapped is kept. */
  endContraction(id: string, now: Date = new Date()): void {
    this.db
      .update(contraction)
      .set({ endedAt: now.toISOString() })
      .where(and(eq(contraction.id, id), isNull(contraction.endedAt)))
      .run();
  }

  /** A few words on one ("had to stop"); empty takes them away. */
  noteContraction(id: string, note: string): void {
    const words = note.trim();
    this.db
      .update(contraction)
      .set({ note: words || null })
      .where(eq(contraction.id, id))
      .run();
  }

  /** Tapped by mistake. */
  deleteContraction(id: string): void {
    this.db.delete(contraction).where(eq(contraction.id, id)).run();
  }

  /** Tick a last thing for the start under way, or untick it. */
  tick(key: string, ticked: boolean, by: string | null, now: Date = new Date()): void {
    const open = this.open();
    if (!open) return;
    if (ticked) this.db.insert(startTick).values({ startId: open.id, key, by, at: now.toISOString() }).onConflictDoNothing().run();
    else
      this.db
        .delete(startTick)
        .where(and(eq(startTick.startId, open.id), eq(startTick.key, key)))
        .run();
  }

  addLine(id: string, title: string, by: string | null, now: Date = new Date()): void {
    this.db.insert(startLine).values({ id, title: title.trim(), by, createdAt: now.toISOString() }).onConflictDoNothing().run();
  }

  deleteLine(id: string): void {
    this.db.delete(startLine).where(eq(startLine.id, id)).run();
    this.db.delete(startTick).where(eq(startTick.key, id)).run();
  }
}
