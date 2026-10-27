import type { Database } from "bun:sqlite";
import { asc, eq } from "drizzle-orm";
import { orm } from "../../connection/client";
import { person } from "./schema";

export type Role = "carrying" | "partner";
export type Person = { id: string; name: string; role: Role };

export const ROLES: Record<Role, string> = {
  carrying: "I'm the one who's pregnant (or will be)",
  partner: "I'm the partner",
};

export class PeopleRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Everyone, in the order they joined. */
  list(): Person[] {
    return this.db.select({ id: person.id, name: person.name, role: person.role }).from(person).orderBy(asc(person.createdAt)).all();
  }

  get(id: string): Person | null {
    return this.db.select({ id: person.id, name: person.name, role: person.role }).from(person).where(eq(person.id, id)).get() ?? null;
  }

  add(name: string, role: Role, now: Date = new Date()): Person {
    const row = { id: crypto.randomUUID(), name: name.trim(), role };
    this.db
      .insert(person)
      .values({ ...row, createdAt: now.toISOString() })
      .run();
    return row;
  }
}
