import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { type AppetiteEntry, type AppetiteInput, tidy } from "../../../lib/appetite";
import { orm } from "../../connection/client";
import { appetiteEntry } from "./schema";

export class AppetiteRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every entry; the page orders them. Shared: both of you see all of them. */
  list(): AppetiteEntry[] {
    return this.db.select().from(appetiteEntry).all();
  }

  /** Add an entry, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  add(input: AppetiteInput, by: string | null, now: Date = new Date()): AppetiteEntry {
    const row: AppetiteEntry = { ...tidy(input), by, createdAt: now.toISOString(), editedBy: null, editedAt: null };
    this.db.insert(appetiteEntry).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change an entry, saying who and when. Either of you can. */
  edit(input: AppetiteInput, by: string | null, now: Date = new Date()): void {
    const { id, ...fields } = tidy(input);
    this.db
      .update(appetiteEntry)
      .set({ ...fields, editedBy: by, editedAt: now.toISOString() })
      .where(eq(appetiteEntry.id, id))
      .run();
  }

  /** Put a deleted entry back as it was (undo); one still here is left as it is. */
  restore(entry: AppetiteEntry): void {
    this.db
      .insert(appetiteEntry)
      .values({ ...entry, ...tidy(entry) })
      .onConflictDoNothing()
      .run();
  }

  delete(id: string): void {
    this.db.delete(appetiteEntry).where(eq(appetiteEntry.id, id)).run();
  }
}
