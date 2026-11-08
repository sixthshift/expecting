import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInItemId } from "../../content";
import { QuestionsRepo } from "../../db/models/questions/repo";
import { save, stamped } from "../../lib/outbox";
import type { Question } from "../../lib/planner/questions";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const id = z.object({ id: z.uuid() }).strict();

const listQuestions = createServerFn({ method: "GET" }).handler(() => new QuestionsRepo(getDb()).list());

const addQuestion = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        id: z.uuid(),
        text: z.string().trim().min(1).max(1000),
        /** The Library entry it was asked from; a private one is refused before this (src/server/privacy/). */
        itemId: z.string().refine(isBuiltInItemId, "Not an entry").optional(),
        /** The appointment it is for: every question is for one. */
        appointmentId: z.uuid(),
      })
      .strict()
  )
  .handler(({ data }) =>
    new QuestionsRepo(getDb()).add(data.text, { itemId: data.itemId, by: personId(), appointmentId: data.appointmentId }, madeAt(), data.id)
  );

const moveQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), appointmentId: z.uuid() }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).move(data.id, data.appointmentId));

const markAsked = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), answer: z.string().max(5000) }).strict())
  .handler(({ data }) => new QuestionsRepo(getDb()).markAsked(data.id, data.answer, madeAt()));

const reopenQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).reopen(data.id));

const deleteQuestion = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new QuestionsRepo(getDb()).delete(data.id));

/** The questions, each for an appointment. */
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
    send: (data: { id: string; text: string; itemId?: string; appointmentId: string }, made) => addQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id, text, itemId, appointmentId }, made) =>
      questions.some((q) => q.id === id)
        ? questions
        : [...questions, { id, text: text.trim(), answer: null, askedAt: null, itemId: itemId ?? null, by: made.by, createdAt: made.at, appointmentId }],
  }),
  moveQuestion: save({
    key: "moveQuestion",
    query: questionsQuery.queryKey,
    send: (data: { id: string; appointmentId: string }, made) => moveQuestion({ data, headers: stamped(made) }),
    apply: (questions: Questions, { id, appointmentId }) => change(questions, id, { appointmentId }),
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

export const useQuestionsQuery = queryHook(questionsQuery);
