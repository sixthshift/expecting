// What a tool knows when it runs: the store, who the connection speaks for,
// and the moment. And what the app would show, tailored the same way
// (src/content/tailor.ts): the answers, the items, the tasks and where you
// are, each worked out only when a tool asks for it.
//
// The moment is the server's clock, in its timezone (`TZ`, docs/development.md):
// the app takes the day from the phone, and Claude has no phone, so "today"
// is the house's.

import type { Database } from "bun:sqlite";
import type { Facts } from "../../app/features/settings/model/facts";
import type { Item, Task } from "../../content/schema";
import { tailorItems, tailorTasks } from "../../content/tailor";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { FactsRepo } from "../../db/models/facts/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { SettingsRepo } from "../../db/models/settings/repo";
import { type ISODate, todayISO } from "../../lib/dates";
import { extrasOn } from "../../lib/extras";
import { type Answer, factsOf } from "../../lib/facts";
import type { Person } from "../../lib/people";
import { type Position, positionOn, type Week } from "../../lib/timeline";

export type Context = { db: Database; personId: string; now: Date };

/** What the app would show now, each part worked out the first time it's read. */
export class Known {
  private readonly cache = new Map<string, unknown>();

  constructor(private readonly ctx: Context) {}

  private once<T>(key: string, work: () => T): T {
    if (!this.cache.has(key)) this.cache.set(key, work());
    return this.cache.get(key) as T;
  }

  get people(): Person[] {
    return this.once("people", () => new PeopleRepo(this.ctx.db).list());
  }
  get me(): Person | null {
    return this.people.find((p) => p.id === this.ctx.personId) ?? null;
  }
  get today(): ISODate {
    return todayISO(this.ctx.now);
  }
  get dueDate(): ISODate | null {
    return this.once("dueDate", () => new SettingsRepo(this.ctx.db).get().dueDate);
  }
  get position(): Position | null {
    return this.dueDate ? positionOn(this.today, this.dueDate) : null;
  }
  get answers(): Answer[] {
    return this.once("answers", () => new FactsRepo(this.ctx.db).latest());
  }
  get facts(): Facts {
    return this.once("facts", () => factsOf(this.answers));
  }
  get extras(): Set<string> {
    return this.once("extras", () => extrasOn(new ExtrasRepo(this.ctx.db).list()));
  }
  get items(): Item[] {
    return this.once("items", () => tailorItems(this.facts, this.extras));
  }
  get tasks(): Task[] {
    return this.once("tasks", () => tailorTasks(this.items, this.facts, this.dueDate, new ChecklistRepo(this.ctx.db).ownTasks()));
  }
  get ticks(): Record<string, string> {
    return this.once("ticks", () => new ChecklistRepo(this.ctx.db).ticks());
  }

  /** A person's name by id, for who kept something. */
  nameOf(id: string | null): string | null {
    return this.people.find((p) => p.id === id)?.name ?? null;
  }

  /** The week a day falls in, given the due date; null without one. */
  weekOf(day: string): Week | null {
    return this.dueDate ? positionOn(day as ISODate, this.dueDate).week : null;
  }
}

export function known(ctx: Context): Known {
  return new Known(ctx);
}

/** The first moment of a day, on the house's clock, as stored times are written. */
export function startOf(day: ISODate): string {
  return new Date(`${day}T00:00:00`).toISOString();
}
