import type { Choice } from "../../../lib/extras";
import { Repo } from "../../connection/client";
import { extra } from "./schema";

/** Which extras exist is content's business, not this repo's. */
export class ExtrasRepo extends Repo {
  /** Every extra someone has decided on. */
  list(): Choice[] {
    return this.db.select().from(extra).all();
  }

  /** Turn an extra on or off: the latest decision stands. */
  set(c: Omit<Choice, "changedAt">, now: Date = new Date()): Choice {
    const row = { ...c, changedAt: now.toISOString() };
    this.db
      .insert(extra)
      .values(row)
      .onConflictDoUpdate({ target: extra.id, set: { on: row.on, changedBy: row.changedBy, changedAt: row.changedAt } })
      .run();
    return row;
  }
}
