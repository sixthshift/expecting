import { and, eq, inArray } from "drizzle-orm";
import type { JournalEntry } from "../../../lib/journal/journal";
import { Repo } from "../../connection/client";
import { journalEntry } from "./schema";

/** A note, or a letter to the baby, `fromBoth` if it's from both of you (a note never is). */
export type NewNote = { id: string; day: string; time: string | null; body: string; kind: "note" | "letter"; fromBoth: boolean };
export type NewMovement = { id: string; day: string; time: string; body: string; different: boolean };

export class JournalRepo extends Repo {
  /** Every entry; the page orders them. */
  list(): JournalEntry[] {
    return this.db.select().from(journalEntry).all();
  }

  /** Add a note, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  add(note: NewNote, by: string | null, now: Date = new Date()): JournalEntry {
    const row: JournalEntry = {
      ...note,
      body: note.body.trim(),
      different: false,
      fromBoth: note.kind === "letter" && note.fromBoth,
      by,
      createdAt: now.toISOString(),
      editedBy: null,
      editedAt: null,
    };
    this.db.insert(journalEntry).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change a note's words, day or time, whether it's a letter, and from both of you, saying who and when. A note is never from both. */
  edit(note: NewNote, by: string | null, now: Date = new Date()): void {
    this.db
      .update(journalEntry)
      .set({
        day: note.day,
        time: note.time,
        body: note.body.trim(),
        kind: note.kind,
        fromBoth: note.kind === "letter" && note.fromBoth,
        editedBy: by,
        editedAt: now.toISOString(),
      })
      .where(and(eq(journalEntry.id, note.id), inArray(journalEntry.kind, ["note", "letter"])))
      .run();
  }

  /** Add a movement, by the id the phone gave it; one already here is left as it is. */
  addMovement(movement: NewMovement, by: string | null, now: Date = new Date()): JournalEntry {
    const row: JournalEntry = {
      ...movement,
      kind: "movement",
      body: movement.body.trim(),
      fromBoth: false,
      by,
      createdAt: now.toISOString(),
      editedBy: null,
      editedAt: null,
    };
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
