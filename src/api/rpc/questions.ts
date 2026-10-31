import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInItemId } from "../../content";
import { PeopleRepo } from "../../db/models/people/repo";
import { QuestionsRepo } from "../../db/models/questions/repo";
import { save, stamped } from "../../lib/outbox";
import type { Question } from "../../lib/questions";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

const id = z.object({ id: z.uuid() }).strict();

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

export const listQuestions = createServerFn({ method: "GET" }).handler(() => new QuestionsRepo(getDb()).list());

export const addQuestion = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        id: z.uuid(),
        text: z.string().trim().min(1).max(1000),
        /** The Library entry it was asked from; a private one is refused before this (src/server/privacy/). */
        itemId: z.string().refine(isBuiltInItemId, "Not an entry").optional(),
      })
      .strict()
  )
  .handler(({ data }) => new QuestionsRepo(getDb()).add(data.text, { itemId: data.itemId, by: known(personId()) }, madeAt(), data.id));

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
    send: (data: { id: string; text: string; itemId?: string }, made) => addQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id, text, itemId }, made) =>
      questions.some((q) => q.id === id)
        ? questions
        : [...questions, { id, text: text.trim(), answer: null, askedAt: null, itemId: itemId ?? null, by: made.by, createdAt: made.at }],
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
