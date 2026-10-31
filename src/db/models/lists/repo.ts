import type { Database } from "bun:sqlite";
import { asc, eq, inArray } from "drizzle-orm";
import type { How, LineState, Mark, OwnLineRow, OwnList } from "../../../lib/lists";
import { orm } from "../../connection/client";
import { listMark, ownLine, ownList } from "./schema";

/** The lists' rows: your own lists and lines, and every line's mark, by line id. */
export type Lists = { ownLists: OwnList[]; ownLines: OwnLineRow[]; marks: Record<string, Mark> };

export class ListsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Your own lists and lines, oldest first, and the marks. */
  all(): Lists {
    return {
      ownLists: this.db.select().from(ownList).orderBy(asc(ownList.createdAt)).all(),
      ownLines: this.db.select().from(ownLine).orderBy(asc(ownLine.createdAt)).all(),
      marks: Object.fromEntries(
        this.db
          .select()
          .from(listMark)
          .all()
          .map((m) => [m.lineId, m])
      ),
    };
  }

  hasList(id: string): boolean {
    return this.db.select({ id: ownList.id }).from(ownList).where(eq(ownList.id, id)).get() !== undefined;
  }

  hasLine(id: string): boolean {
    return this.db.select({ id: ownLine.id }).from(ownLine).where(eq(ownLine.id, id)).get() !== undefined;
  }

  /** Add a list, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  addList({ id, title }: { id: string; title: string }, by: string | null = null, now: Date = new Date()): OwnList {
    const row: OwnList = { id, title, by, createdAt: now.toISOString() };
    this.db.insert(ownList).values(row).onConflictDoNothing().run();
    return row;
  }

  renameList(id: string, title: string): void {
    this.db.update(ownList).set({ title }).where(eq(ownList.id, id)).run();
  }

  /** Delete a list of your own, its lines and their marks. */
  deleteList(id: string): void {
    this.db.transaction((tx) => {
      const lines = tx.select({ id: ownLine.id }).from(ownLine).where(eq(ownLine.listId, id)).all();
      if (lines.length > 0)
        tx.delete(listMark)
          .where(
            inArray(
              listMark.lineId,
              lines.map((l) => l.id)
            )
          )
          .run();
      tx.delete(ownLine).where(eq(ownLine.listId, id)).run();
      tx.delete(ownList).where(eq(ownList.id, id)).run();
    });
  }

  /** Add a line of your own, by the id the phone gave it; one already here is left as it is. */
  addLine(
    { id, listId, title, section = null }: { id: string; listId: string; title: string; section?: string | null },
    by: string | null = null,
    now: Date = new Date()
  ): OwnLineRow {
    const row: OwnLineRow = { id, listId, title, section, by, createdAt: now.toISOString() };
    this.db.insert(ownLine).values(row).onConflictDoNothing().run();
    return row;
  }

  changeLine(id: string, { title, section }: { title: string; section: string | null }): void {
    this.db.update(ownLine).set({ title, section }).where(eq(ownLine.id, id)).run();
  }

  /** Delete a line of your own and its mark. */
  deleteLine(id: string): void {
    this.db.transaction((tx) => {
      tx.delete(listMark).where(eq(listMark.lineId, id)).run();
      tx.delete(ownLine).where(eq(ownLine.id, id)).run();
    });
  }

  /**
   * Mark a line, by whoever is holding the phone: its state (null, still to
   * get), how it was got (kept only once got) and a few words (empty is
   * none). With neither a state nor words, the mark goes.
   */
  mark(
    lineId: string,
    { state, how = null, note = null }: { state: LineState | null; how?: How | null; note?: string | null },
    by: string | null = null,
    now: Date = new Date()
  ): void {
    const words = note?.trim() || null;
    if (state === null && words === null) {
      this.db.delete(listMark).where(eq(listMark.lineId, lineId)).run();
      return;
    }
    const row = { lineId, state, how: state === "got" ? how : null, note: words, by, updatedAt: now.toISOString() };
    this.db.insert(listMark).values(row).onConflictDoUpdate({ target: listMark.lineId, set: row }).run();
  }
}
