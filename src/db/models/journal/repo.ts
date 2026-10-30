import type { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import type { JournalEntry } from "../../../lib/journal";
import { orm } from "../../connection/client";
import { journalEntry } from "./schema";

export type NewNote = { id: string; day: string; time: string | null; body: string };
export type NewMovement = { id: string; day: string; time: string; body: string; different: boolean };

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
    const row: JournalEntry = {
      ...note,
      kind: "note",
      body: note.body.trim(),
      different: false,
      by,
      createdAt: now.toISOString(),
      editedBy: null,
      editedAt: null,
    };
    this.db.insert(journalEntry).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change a note's words, day or time, saying who and when. */
  edit(note: NewNote, by: string | null, now: Date = new Date()): void {
    this.db
      .update(journalEntry)
      .set({ day: note.day, time: note.time, body: note.body.trim(), editedBy: by, editedAt: now.toISOString() })
      .where(and(eq(journalEntry.id, note.id), eq(journalEntry.kind, "note")))
      .run();
  }

  /** Add a movement, by the id the phone gave it; one already here is left as it is. */
  addMovement(movement: NewMovement, by: string | null, now: Date = new Date()): JournalEntry {
    const row: JournalEntry = { ...movement, kind: "movement", body: movement.body.trim(), by, createdAt: now.toISOString(), editedBy: null, editedAt: null };
    this.db.insert(journalEntry).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change a movement's day, time, words or whether it felt different, saying who and when. */
  editMovement(movement: NewMovement, by: string | null, now: Date = new Date()): void {
    this.db
      .update(journalEntry)
      .set({
        day: movement.day,
        time: movement.time,
        body: movement.body.trim(),
        different: movement.different,
        editedBy: by,
        editedAt: now.toISOString(),
      })
      .where(and(eq(journalEntry.id, movement.id), eq(journalEntry.kind, "movement")))
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
