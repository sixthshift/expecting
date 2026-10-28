import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInTaskId } from "../../content";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { WEEKS } from "../../lib/timeline";
import { getDb } from "../../server/core/db";

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
