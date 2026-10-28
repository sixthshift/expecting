import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { QuestionsRepo } from "../../db/models/questions/repo";
import { getDb } from "../../server/core/db";

const id = z.object({ id: z.uuid() }).strict();

export const listQuestions = createServerFn({ method: "GET" }).handler(() => new QuestionsRepo(getDb()).list());

export const addQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().trim().min(1).max(1000) }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).add(data.text));

export const markAsked = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), answer: z.string().max(5000) }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).markAsked(data.id, data.answer));

export const reopenQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).reopen(data.id));

export const deleteQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).delete(data.id));
