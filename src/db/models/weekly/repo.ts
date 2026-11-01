import type { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import type { Week } from "../../../lib/timeline";
import type { WeeklyAnswer, WeeklyView } from "../../../lib/weekly";
import { orm } from "../../connection/client";
import { weeklyAnswer } from "./schema";

export class WeeklyRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /**
   * The weeks as `personId` sees them: their own answers, and the other's
   * only for a week they've both answered. A phone that hasn't said who's
   * holding it (null) sees only the weeks both have answered.
   */
  view(personId: string | null): WeeklyView {
    const rows = this.db.select().from(weeklyAnswer).all();
    const byWeek = new Map<number, typeof rows>();
    for (const r of rows) byWeek.set(r.week, [...(byWeek.get(r.week) ?? []), r]);
    const answer = (r: (typeof rows)[number]): WeeklyAnswer => ({ body: r.body, by: r.personId, answeredAt: r.answeredAt });
    return {
      weeks: [...byWeek.entries()]
        .sort(([a], [b]) => a - b)
        .flatMap(([week, answers]) => {
          if (personId === null) {
            if (answers.length < 2) return [];
            const [a, b] = answers.sort((x, y) => x.answeredAt.localeCompare(y.answeredAt));
            return [{ week: week as Week, mine: answer(a!), theirs: answer(b!) }];
          }
          const mine = answers.find((r) => r.personId === personId);
          const theirs = answers.find((r) => r.personId !== personId);
          if (!mine) return [];
          return [{ week: week as Week, mine: answer(mine), theirs: theirs ? answer(theirs) : null }];
        }),
    };
  }

  /** Answer a week's question, or answer it again (keeping when it was first answered); empty takes the answer back. */
  answer(week: number, personId: string, body: string, now: Date = new Date()): void {
    const words = body.trim();
    if (words.length === 0) {
      this.db
        .delete(weeklyAnswer)
        .where(and(eq(weeklyAnswer.week, week), eq(weeklyAnswer.personId, personId)))
        .run();
      return;
    }
    this.db
      .insert(weeklyAnswer)
      .values({ week, personId, body: words, answeredAt: now.toISOString() })
      .onConflictDoUpdate({ target: [weeklyAnswer.week, weeklyAnswer.personId], set: { body: words } })
      .run();
  }
}
