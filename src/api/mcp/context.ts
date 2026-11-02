// What a tool knows when it runs: the store, who the connection speaks for,
// and the moment. And what the app would show, tailored the same way
// (src/content/tailor.ts): the items, the tasks and where you are.

import type { Database } from "bun:sqlite";
import type { Item, Task } from "../../content/schema";
import { tailorItems, tailorTasks } from "../../content/tailor";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { FactsRepo } from "../../db/models/facts/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { SettingsRepo } from "../../db/models/settings/repo";
import type { Facts } from "../../features/settings/model/facts";
import { type ISODate, todayISO } from "../../lib/dates";
import { extrasOn } from "../../lib/extras";
import { factsOf } from "../../lib/facts";
import type { Person } from "../../lib/people";
import { type Position, positionOn } from "../../lib/timeline";

export type Context = { db: Database; personId: string; now: Date };

/** What the app would show now. */
export type Known = {
  me: Person | null;
  people: Person[];
  dueDate: ISODate | null;
  today: ISODate;
  position: Position | null;
  facts: Facts;
  items: Item[];
  tasks: Task[];
  ticks: Record<string, string>;
};

export function known({ db, personId, now }: Context): Known {
  const facts = factsOf(new FactsRepo(db).latest());
  const items = tailorItems(facts, extrasOn(new ExtrasRepo(db).list()));
  const { dueDate } = new SettingsRepo(db).get();
  const checklist = new ChecklistRepo(db);
  const today = todayISO(now);
  const people = new PeopleRepo(db).list();
  return {
    me: people.find((p) => p.id === personId) ?? null,
    people,
    dueDate,
    today,
    position: dueDate ? positionOn(today, dueDate) : null,
    facts,
    items,
    tasks: tailorTasks(items, facts, dueDate, checklist.ownTasks()),
    ticks: checklist.ticks(),
  };
}

/** A person's name by id, for who kept something. */
export function nameOf(people: readonly Person[], id: string | null): string | null {
  return people.find((p) => p.id === id)?.name ?? null;
}
