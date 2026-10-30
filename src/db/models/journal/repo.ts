import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { JournalEntry } from "../../../lib/journal";
import { orm } from "../../connection/client";
import { journalEntry } from "./schema";

export type NewNote = { id: string; day: string; time: string | null; body: string };

export class JournalRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every entry; the page orders them. */
  list(): JournalEntry[] {
    return this.db.select().from(journalEntry).all();
  }

  /** Add a note, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  add(note: NewNote, by: string | null, now: Date = new Date()): JournalEntry {
    const row: JournalEntry = { ...note, kind: "note", body: note.body.trim(), by, createdAt: now.toISOString(), editedBy: null, editedAt: null };
    this.db.insert(journalEntry).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change a note's words, day or time, saying who and when. */
  edit(note: NewNote, by: string | null, now: Date = new Date()): void {
    this.db
      .update(journalEntry)
      .set({ day: note.day, time: note.time, body: note.body.trim(), editedBy: by, editedAt: now.toISOString() })
      .where(eq(journalEntry.id, note.id))
      .run();
  }

  /** Put a deleted entry back as it was (undo); one still here is left as it is. */
  restore(entry: JournalEntry): void {
    this.db.insert(journalEntry).values(entry).onConflictDoNothing().run();
  }

  delete(id: string): void {
    this.db.delete(journalEntry).where(eq(journalEntry.id, id)).run();
  }
}
