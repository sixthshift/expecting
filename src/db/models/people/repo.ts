import { asc, eq } from "drizzle-orm";
import { otherRole, type Person, type Role } from "../../../lib/people";
import { Repo } from "../../connection/client";
import { person } from "./schema";

/** A person's password: its hash, null until one is chosen (never, with logins off). */
export type Password = { hash: string | null };

export class PeopleRepo extends Repo {
  /** Everyone, in the order they joined. */
  list(): Person[] {
    return this.db.select({ id: person.id, name: person.name, role: person.role }).from(person).orderBy(asc(person.createdAt)).all();
  }

  get(id: string): Person | null {
    return this.db.select({ id: person.id, name: person.name, role: person.role }).from(person).where(eq(person.id, id)).get() ?? null;
  }

  /**
   * Someone joins, with their password's hash (none with logins off). Throws,
   * adding nothing, when there are two of you already or their role is taken
   * (the `person_two_at_most` trigger): ask `openRole` first.
   */
  add(name: string, role: Role, { passwordHash = null, now = new Date() }: { passwordHash?: string | null; now?: Date } = {}): Person {
    const row = { id: crypto.randomUUID(), name: name.trim(), role };
    this.db
      .insert(person)
      .values({ ...row, createdAt: now.toISOString(), passwordHash })
      .run();
    return row;
  }

  /** The place left for the other to join: while there is one of you, the other role; null with nobody yet, or both. */
  openRole(): Role | null {
    const people = this.list();
    return people.length === 1 ? otherRole(people[0]!.role) : null;
  }

  password(id: string): Password | null {
    return this.db.select({ hash: person.passwordHash }).from(person).where(eq(person.id, id)).get() ?? null;
  }

  /** `id` chose a new password. */
  setPassword(id: string, passwordHash: string): void {
    this.db.update(person).set({ passwordHash }).where(eq(person.id, id)).run();
  }
}
