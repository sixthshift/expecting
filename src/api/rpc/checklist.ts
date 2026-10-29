import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInTaskId } from "../../content";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { WEEKS } from "../../lib/timeline";
import { getDb } from "../../server/core/db";

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
    repo.setTicked(data.taskId, data.ticked);
  });

const ownTaskInput = z
  .object({ title: z.string(), week: z.number().int().min(WEEKS.first).max(WEEKS.last) })
  .strict()
  .transform((t) => ({ ...t, title: t.title.trim() }))
  .refine((t) => t.title.length > 0 && t.title.length <= 200, "a title of 1–200 characters");

export const addOwnTask = createServerFn({ method: "POST" })
  .validator(ownTaskInput)
  .handler(({ data }) => new ChecklistRepo(getDb()).addOwnTask(data));

export const deleteOwnTask = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new ChecklistRepo(getDb()).deleteOwnTask(data.id));

/** The checklist: what's ticked, and the tasks you added yourselves. */
export type Checklist = Awaited<ReturnType<typeof getChecklist>>;
export const checklistQuery = queryOptions({ queryKey: ["checklist"], queryFn: () => getChecklist() });

/** checklistQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useChecklist<TData = Checklist>(options?: Omit<UseSuspenseQueryOptions<Checklist, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...checklistQuery, ...options } as UseSuspenseQueryOptions<Checklist, Error, TData, string[]>);
}
