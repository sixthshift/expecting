import type { Database } from "bun:sqlite";
import { and, asc, desc, eq, gt, isNull, lt } from "drizzle-orm";
import type { Ending, ItsTime, Start, Waters } from "../../../lib/itsTime";
import { orm } from "../../connection/client";
import { contraction, labourStart, startLine, startTick } from "./schema";

/**
 * It's time's starts, their contractions and ticks, and your own last things.
 * Every save names its start; the start under way under another id (opened on
 * the other phone) stands in for it, so both phones' taps land on one. A save
 * for a start that has ended does nothing.
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

  /**
   * The start a save names. Saves can arrive out of order (the outbox sends
   * what waited offline when the connection comes back), so one that names a
   * start not yet here opens it, at its own time; one under way under another
   * id (the other phone opened it) is the same start. An ended one is left
   * ended. Null when the save names a start that has ended and isn't the one
   * under way.
   */
  private ensure(id: string, by: string | null, now: Date) {
    const named = this.db.select().from(labourStart).where(eq(labourStart.id, id)).get();
    if (named) return named.endedAt === null ? named : null;
    const open = this.open();
    if (open) return open;
    this.db.insert(labourStart).values({ id, startedAt: now.toISOString(), by }).run();
    return this.db.select().from(labourStart).where(eq(labourStart.id, id)).get() ?? null;
  }

  /** Open a start, with the waters broken or not, unless one is under way: then it's that one, with the waters added if they're new. */
  begin(id: string, waters: boolean, by: string | null, now: Date = new Date()): void {
    const start = this.ensure(id, by, now);
    if (!start) return;
    // Opened by an earlier save that arrived first: it began now, if that's earlier.
    if (start.id === id && now.toISOString() < start.startedAt) {
      this.db.update(labourStart).set({ startedAt: now.toISOString(), by }).where(eq(labourStart.id, id)).run();
    }
    if (waters) this.setWaters(id, null, now);
  }

  /** The waters: the first time they broke is kept; the colour (null, not said yet) can change, and isn't lost by saying nothing. */
  setWaters(startId: string, waters: Waters | null, now: Date = new Date()): void {
    const start = this.ensure(startId, null, now);
    if (!start) return;
    const at = now.toISOString();
    this.db
      .update(labourStart)
      .set({ waters: waters ?? start.waters, watersAt: start.watersAt && start.watersAt < at ? start.watersAt : at })
      .where(eq(labourStart.id, start.id))
      .run();
  }

  /** You've set off: the first time is kept. */
  leave(startId: string, now: Date = new Date()): void {
    const start = this.ensure(startId, null, now);
    if (!start || start.leftAt) return;
    this.db.update(labourStart).set({ leftAt: now.toISOString() }).where(eq(labourStart.id, start.id)).run();
  }

  /** The start is over: we're there, or home again. */
  end(startId: string, ended: Ending, now: Date = new Date()): void {
    const start = this.ensure(startId, null, now);
    if (!start) return;
    this.db.update(labourStart).set({ ended, endedAt: now.toISOString() }).where(eq(labourStart.id, start.id)).run();
    // A contraction still being timed ends with it.
    this.db
      .update(contraction)
      .set({ endedAt: now.toISOString() })
      .where(and(eq(contraction.startId, start.id), isNull(contraction.endedAt)))
      .run();
  }

  /** Take a start back off, contractions and all: from the Journal, or a false alarm you'd rather not keep. */
  delete(id: string): void {
    this.db.delete(labourStart).where(eq(labourStart.id, id)).run();
  }

  /** One begins, on its start; one still going is ended first. Already here (its end arrived first), it's left as it is. */
  beginContraction(id: string, startId: string, by: string | null, now: Date = new Date()): void {
    if (this.db.select().from(contraction).where(eq(contraction.id, id)).get()) return;
    const start = this.ensure(startId, by, now);
    if (!start) return;
    const at = now.toISOString();
    this.db
      .update(contraction)
      .set({ endedAt: at })
      .where(and(eq(contraction.startId, start.id), isNull(contraction.endedAt), lt(contraction.startedAt, at)))
      .run();
    // An earlier tap arriving after a later one: it ended when the later one began.
    const later = this.db
      .select()
      .from(contraction)
      .where(and(eq(contraction.startId, start.id), gt(contraction.startedAt, at)))
      .orderBy(asc(contraction.startedAt))
      .get();
    this.db
      .insert(contraction)
      .values({ id, startId: start.id, startedAt: at, endedAt: later?.startedAt ?? null, by })
      .run();
  }

  /** One ends: the first end tapped is kept. Its start comes with it, so an end that arrives before its beginning still keeps both. */
  endContraction(id: string, startId: string, startedAt: string, now: Date = new Date()): void {
    const at = now.toISOString();
    if (!this.db.select().from(contraction).where(eq(contraction.id, id)).get()) {
      const start = this.ensure(startId, null, new Date(startedAt));
      if (!start) return;
      this.db
        .insert(contraction)
        .values({ id, startId: start.id, startedAt, endedAt: at < startedAt ? startedAt : at })
        .run();
      return;
    }
    this.db
      .update(contraction)
      .set({ endedAt: at })
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

  /** Tick a last thing for its start, or untick it. */
  tick(startId: string, key: string, ticked: boolean, by: string | null, now: Date = new Date()): void {
    const start = this.ensure(startId, by, now);
    if (!start) return;
    if (ticked) this.db.insert(startTick).values({ startId: start.id, key, by, at: now.toISOString() }).onConflictDoNothing().run();
    else
      this.db
        .delete(startTick)
        .where(and(eq(startTick.startId, start.id), eq(startTick.key, key)))
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
