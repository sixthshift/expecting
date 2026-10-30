import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { QuestionsRepo } from "../../db/models/questions/repo";
import { save, stamped } from "../../lib/outbox";
import type { Question } from "../../lib/questions";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";

const id = z.object({ id: z.uuid() }).strict();

export const listQuestions = createServerFn({ method: "GET" }).handler(() => new QuestionsRepo(getDb()).list());

export const addQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), text: z.string().trim().min(1).max(1000) }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).add(data.text, madeAt(), data.id));

export const markAsked = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), answer: z.string().max(5000) }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).markAsked(data.id, data.answer, madeAt()));

export const reopenQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).reopen(data.id));

export const deleteQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).delete(data.id));

/** The questions for the next appointment. */
export type Questions = Awaited<ReturnType<typeof listQuestions>>;
export const questionsQuery = queryOptions({ queryKey: ["questions"], queryFn: () => listQuestions() });

/** Changing one question, by id. */
function change(questions: Questions, id: string, to: Partial<Question>): Questions {
  return questions.map((q) => (q.id === id ? { ...q, ...to } : q));
}

/** The questions' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const questionsSaves = {
  addQuestion: save({
    key: "addQuestion",
    query: questionsQuery.queryKey,
    send: (data: { id: string; text: string }, made) => addQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id, text }, made) =>
      questions.some((q) => q.id === id) ? questions : [...questions, { id, text: text.trim(), answer: null, askedAt: null, createdAt: made.at }],
  }),
  markAsked: save({
    key: "markAsked",
    query: questionsQuery.queryKey,
    send: (data: { id: string; answer: string }, made) => markAsked({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id, answer }, made) => change(questions, id, { askedAt: made.at, answer: answer.trim() || null }),
  }),
  reopenQuestion: save({
    key: "reopenQuestion",
    query: questionsQuery.queryKey,
    send: (data: { id: string }, made) => reopenQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id }) => change(questions, id, { askedAt: null }),
  }),
  deleteQuestion: save({
    key: "deleteQuestion",
    query: questionsQuery.queryKey,
    send: (data: { id: string }, made) => deleteQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id }) => questions.filter((q) => q.id !== id),
  }),
};

/** questionsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useQuestions<TData = Questions>(options?: Omit<UseSuspenseQueryOptions<Questions, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...questionsQuery, ...options } as UseSuspenseQueryOptions<Questions, Error, TData, string[]>);
}
