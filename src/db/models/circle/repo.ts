import type { Database } from "bun:sqlite";
import { asc, eq } from "drizzle-orm";
import type { Circle, CirclePerson, Gift, PersonPatch } from "../../../lib/circle";
import { patched } from "../../../lib/circle";
import { orm } from "../../connection/client";
import { announcement, circleGift, circlePerson } from "./schema";

export class CircleRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Your people, the oldest first, their gifts, and the announcement. */
  all(): Circle {
    const words = this.db.select().from(announcement).where(eq(announcement.id, 1)).get();
    return {
      people: this.db.select().from(circlePerson).orderBy(asc(circlePerson.createdAt)).all() as CirclePerson[],
      gifts: this.db.select().from(circleGift).orderBy(asc(circleGift.createdAt)).all(),
      announcement: words ? { body: words.body, by: words.by, updatedAt: words.updatedAt } : null,
    };
  }

  person(id: string): CirclePerson | undefined {
    return this.db.select().from(circlePerson).where(eq(circlePerson.id, id)).get() as CirclePerson | undefined;
  }

  /** Add someone, by the id the phone gave them; one already here (the same save, sent twice) is left as it is. */
  addPerson({ id, name, note }: { id: string; name: string; note: string | null }, by: string | null = null, now: Date = new Date()): CirclePerson {
    const row: CirclePerson = {
      id,
      name: name.trim(),
      note: note?.trim() || null,
      visit: null,
      hears: null,
      help: null,
      mealDay: null,
      by,
      createdAt: now.toISOString(),
    };
    this.db.insert(circlePerson).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Change someone's name and words. */
  renamePerson(id: string, { name, note }: { name: string; note: string | null }): void {
    this.db
      .update(circlePerson)
      .set({ name: name.trim(), note: note?.trim() || null })
      .where(eq(circlePerson.id, id))
      .run();
  }

  /** Set what a view sets on someone (patched, src/lib/circle.ts); someone not here is left alone. */
  setPerson(id: string, patch: PersonPatch): void {
    const now = this.person(id);
    if (!now) return;
    const { visit, hears, help, mealDay } = patched(now, patch);
    this.db.update(circlePerson).set({ visit, hears, help, mealDay }).where(eq(circlePerson.id, id)).run();
  }

  /** Delete someone, and what they gave. */
  deletePerson(id: string): void {
    this.db.delete(circlePerson).where(eq(circlePerson.id, id)).run();
  }

  /** Add a gift, by the id the phone gave it; one already here is left as it is. */
  addGift({ id, personId, what }: { id: string; personId: string; what: string }, by: string | null = null, now: Date = new Date()): Gift {
    const row: Gift = { id, personId, what: what.trim(), thankedAt: null, by, createdAt: now.toISOString() };
    this.db.insert(circleGift).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Thanked, or not yet: thanked again keeps the first day. */
  thankGift(id: string, thanked: boolean, now: Date = new Date()): void {
    const gift = this.db.select().from(circleGift).where(eq(circleGift.id, id)).get();
    if (!gift || thanked === (gift.thankedAt !== null)) return;
    this.db
      .update(circleGift)
      .set({ thankedAt: thanked ? now.toISOString() : null })
      .where(eq(circleGift.id, id))
      .run();
  }

  deleteGift(id: string): void {
    this.db.delete(circleGift).where(eq(circleGift.id, id)).run();
  }

  /** The words for the birth; empty takes them away. */
  setAnnouncement(body: string, by: string | null = null, now: Date = new Date()): void {
    const words = body.trim();
    if (words.length === 0) {
      this.db.delete(announcement).where(eq(announcement.id, 1)).run();
      return;
    }
    const row = { id: 1, body: words, by, updatedAt: now.toISOString() };
    this.db.insert(announcement).values(row).onConflictDoUpdate({ target: announcement.id, set: row }).run();
  }
}
