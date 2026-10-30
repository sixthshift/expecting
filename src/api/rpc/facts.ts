// The facts: your answers to src/features/settings/model/facts.data.ts's questions, each
// kept with who answered and when.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FactsRepo } from "../../db/models/facts/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { ask, factKey, isAnswer } from "../../features/settings/model/facts";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Every answer's latest, for questions still asked: one whose question has gone is left out. */
export const getAnswers = createServerFn({ method: "GET" }).handler(() =>
  new FactsRepo(getDb()).latest().filter((a) => ask(factKey(a.question, a.about)) !== undefined)
);

/** Answer a question, or skip or clear it with null. The person holding this phone answered it. */
export const saveAnswer = createServerFn({ method: "POST" })
  .validator(
    z
      .object({ key: z.string(), answer: z.string().nullable() })
      .strict()
      .refine((a) => ask(a.key) !== undefined, "not a question in facts.data.ts")
      .refine((a) => a.answer === null || isAnswer(a.key, a.answer), "not an answer to that question")
  )
  .handler(({ data }) => {
    const db = getDb();
    const { question, about } = ask(data.key)!;
    const id = personId();
    const answeredBy = id && new PeopleRepo(db).get(id) ? id : null;
    return new FactsRepo(db).answer({ question: question.id, about, value: data.answer, answeredBy }, madeAt());
  });

export type Answers = Awaited<ReturnType<typeof getAnswers>>;
export const answersQuery = queryOptions({ queryKey: ["answers"], queryFn: () => getAnswers() });

/** The answers' save, through the outbox (src/app/model/outbox.ts): it shows at once, and is sent when it can be. */
export const factsSaves = {
  saveAnswer: save({
    key: "saveAnswer",
    query: answersQuery.queryKey,
    send: (data: { key: string; answer: string | null }, made) => saveAnswer({ data, headers: stamped(made) }),
    apply: (answers: Answers, { key, answer }, made) => {
      const asked = ask(key);
      if (!asked) return answers;
      const others = answers.filter((a) => factKey(a.question, a.about) !== key);
      return [...others, { question: asked.question.id, about: asked.about, value: answer, answeredBy: made.by, answeredAt: made.at }];
    },
  }),
};

/** answersQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useAnswers<TData = Answers>(options?: Omit<UseSuspenseQueryOptions<Answers, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...answersQuery, ...options } as UseSuspenseQueryOptions<Answers, Error, TData, string[]>);
}
