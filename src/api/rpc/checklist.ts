import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInTaskId } from "../../content";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import type { OwnTaskRow } from "../../lib/checklist";
import { save, stamped } from "../../lib/outbox";
import { WEEKS, type Week } from "../../lib/timeline";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";

/** The ticks and the tasks you added yourselves. */
export const getChecklist = createServerFn({ method: "GET" }).handler(() => {
  const repo = new ChecklistRepo(getDb());
  return { ticks: repo.ticks(), ownTasks: repo.ownTasks() };
});

export const setTicked = createServerFn({ method: "POST" })
  .validator(z.object({ taskId: z.string().min(1).max(200), ticked: z.boolean() }).strict())
  .handler(({ data }) => {
    const repo = new ChecklistRepo(getDb());
    if (!isBuiltInTaskId(data.taskId) && !repo.hasOwnTask(data.taskId)) throw new Error(`No task ${data.taskId}`);
    repo.setTicked(data.taskId, data.ticked, madeAt());
  });

const ownTaskInput = z
  .object({ id: z.uuid(), title: z.string(), week: z.number().int().min(WEEKS.first).max(WEEKS.last) })
  .strict()
  .transform((t) => ({ ...t, title: t.title.trim() }))
  .refine((t) => t.title.length > 0 && t.title.length <= 200, "a title of 1–200 characters");

export const addOwnTask = createServerFn({ method: "POST" })
  .validator(ownTaskInput)
  .handler(({ data }) => new ChecklistRepo(getDb()).addOwnTask(data, madeAt()));

export const deleteOwnTask = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new ChecklistRepo(getDb()).deleteOwnTask(data.id));

/** The checklist: what's ticked, and the tasks you added yourselves. */
export type Checklist = Awaited<ReturnType<typeof getChecklist>>;
export const checklistQuery = queryOptions({ queryKey: ["checklist"], queryFn: () => getChecklist() });

/** The checklist's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const checklistSaves = {
  setTicked: save({
    key: "setTicked",
    query: checklistQuery.queryKey,
    send: (data: { taskId: string; ticked: boolean }, made) => setTicked({ data, headers: stamped(made) }),
    apply: (c: Checklist, { taskId, ticked }, made) => {
      if (ticked) return taskId in c.ticks ? c : { ...c, ticks: { ...c.ticks, [taskId]: made.at } };
      const { [taskId]: _, ...ticks } = c.ticks;
      return { ...c, ticks };
    },
  }),
  addOwnTask: save({
    key: "addOwnTask",
    query: checklistQuery.queryKey,
    send: (data: { id: string; title: string; week: Week }, made) => addOwnTask({ data, headers: stamped(made) }),
    apply: (c: Checklist, { id, title, week }, made) => {
      if (c.ownTasks.some((t) => t.id === id)) return c;
      const task: OwnTaskRow = { id, title: title.trim(), week, createdAt: made.at };
      return { ...c, ownTasks: [...c.ownTasks, task] };
    },
  }),
  deleteOwnTask: save({
    key: "deleteOwnTask",
    query: checklistQuery.queryKey,
    send: (data: { id: string }, made) => deleteOwnTask({ data, headers: stamped(made) }),
    apply: (c: Checklist, { id }) => {
      const { [id]: _, ...ticks } = c.ticks;
      return { ticks, ownTasks: c.ownTasks.filter((t) => t.id !== id) };
    },
  }),
};

/** checklistQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useChecklist<TData = Checklist>(options?: Omit<UseSuspenseQueryOptions<Checklist, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...checklistQuery, ...options } as UseSuspenseQueryOptions<Checklist, Error, TData, string[]>);
}
