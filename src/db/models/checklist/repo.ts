import type { Database } from "bun:sqlite";
import { asc, eq } from "drizzle-orm";
import type { OwnTaskRow } from "../../../lib/checklist";
import type { Week } from "../../../lib/timeline";
import { orm } from "../../connection/client";
import { ownTask, taskTick } from "./schema";

export class ChecklistRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** When each ticked task was ticked, by task id. */
  ticks(): Record<string, string> {
    const rows = this.db.select().from(taskTick).all();
    return Object.fromEntries(rows.map((r) => [r.taskId, r.tickedAt]));
  }

  /** Tick or untick. Ticking an already ticked task keeps its first time. */
  setTicked(taskId: string, ticked: boolean, now: Date = new Date()): void {
    if (ticked) {
      this.db.insert(taskTick).values({ taskId, tickedAt: now.toISOString() }).onConflictDoNothing().run();
    } else {
      this.db.delete(taskTick).where(eq(taskTick.taskId, taskId)).run();
    }
  }

  ownTasks(): OwnTaskRow[] {
    return this.db.select().from(ownTask).orderBy(asc(ownTask.createdAt)).all();
  }

  hasOwnTask(id: string): boolean {
    return this.db.select({ id: ownTask.id }).from(ownTask).where(eq(ownTask.id, id)).get() !== undefined;
  }

  /** Add a task, by the id the phone gave it; one already here (the same save, sent twice) is left as it is. */
  addOwnTask(task: { id?: string; title: string; week: Week }, now: Date = new Date()): OwnTaskRow {
    const row: OwnTaskRow = { ...task, id: task.id ?? crypto.randomUUID(), createdAt: now.toISOString() };
    this.db.insert(ownTask).values(row).onConflictDoNothing().run();
    return row;
  }

  /** Delete an own task and its tick. */
  deleteOwnTask(id: string): void {
    this.db.transaction((tx) => {
      tx.delete(taskTick).where(eq(taskTick.taskId, id)).run();
      tx.delete(ownTask).where(eq(ownTask.id, id)).run();
    });
  }
}
