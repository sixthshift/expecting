import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { type Photo, type PhotoChange, type PhotoInput, tidyCaption } from "../../../lib/photos";
import { orm } from "../../connection/client";
import { photo } from "./schema";

export class PhotosRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Every photo; the page orders them. Shared: both of you see all of them. */
  list(): Photo[] {
    return this.db.select().from(photo).all();
  }

  get(id: string): Photo | null {
    return this.db.select().from(photo).where(eq(photo.id, id)).get() ?? null;
  }

  /** Keep a photo, by the id the phone gave it, once its upload is here; one already here (the same save, sent twice) is left as it is. */
  add(input: PhotoInput, by: string | null, now: Date = new Date()): Photo {
    const row: Photo = { ...input, caption: tidyCaption(input.caption), by, createdAt: now.toISOString(), editedBy: null, editedAt: null };
    this.db.insert(photo).values(row).onConflictDoNothing().run();
    return this.get(input.id) ?? row;
  }

  /** Change what it is, when, and its words, saying who and when. Never its picture. Either of you can. */
  edit({ id, ...fields }: PhotoChange, by: string | null, now: Date = new Date()): void {
    this.db
      .update(photo)
      .set({ ...fields, caption: tidyCaption(fields.caption), editedBy: by, editedAt: now.toISOString() })
      .where(eq(photo.id, id))
      .run();
  }

  /** Forget a photo, saying which upload it showed (for the caller to drop), or null if it wasn't here. */
  delete(id: string): string | null {
    const found = this.get(id);
    if (!found) return null;
    this.db.delete(photo).where(eq(photo.id, id)).run();
    return found.fileId;
  }
}
