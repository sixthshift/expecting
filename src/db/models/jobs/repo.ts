import type { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import { JOBS, type JobsView, type Pick } from "../../../lib/jobs";
import { orm } from "../../connection/client";
import { person } from "../people/schema";
import { jobPick } from "./schema";

export class JobsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /**
   * The jobs as `personId` sees them: their own answers, and the other's
   * only for a job they've both answered; of the rest, only how many.
   */
  view(personId: string): JobsView {
    const picks = this.db.select().from(jobPick).all();
    const mine = new Map(picks.filter((p) => p.personId === personId).map((p) => [p.jobId, p.pick]));
    const theirs = new Map(picks.filter((p) => p.personId !== personId).map((p) => [p.jobId, p.pick]));
    const people = this.db.select({ id: person.id }).from(person).all().length;
    return {
      answers: JOBS.map((job) => {
        const m = mine.get(job.id) ?? null;
        return { jobId: job.id, mine: m, theirs: m ? (theirs.get(job.id) ?? null) : null };
      }),
      theirCount: theirs.size,
      together: people > 1,
    };
  }

  /** Answer a job, or answer it again. */
  pick(jobId: string, personId: string, pick: Pick, now: Date = new Date()): void {
    const row = { jobId, personId, pick, updatedAt: now.toISOString() };
    this.db
      .insert(jobPick)
      .values(row)
      .onConflictDoUpdate({ target: [jobPick.jobId, jobPick.personId], set: { pick, updatedAt: row.updatedAt } })
      .run();
  }

  /** Take an answer back: the job is dealt again. */
  unpick(jobId: string, personId: string): void {
    this.db
      .delete(jobPick)
      .where(and(eq(jobPick.jobId, jobId), eq(jobPick.personId, personId)))
      .run();
  }
}
