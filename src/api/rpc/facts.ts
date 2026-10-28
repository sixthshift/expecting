// The household's facts: its answers to content/facts.yaml's questions, each
// kept with who answered and when.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ask, isAnswer } from "../../content/facts";
import { FactsRepo } from "../../db/models/facts/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

/** The latest answer to each question, for each of you where it's asked of each; answers no longer in facts.yaml are left out. */
export const getAnswers = createServerFn({ method: "GET" }).handler(() =>
  new FactsRepo(getDb()).latest().filter((a) => ask(a.about === "household" ? a.question : `${a.question}.${a.about}`) !== undefined)
);

/** Answer a question, or skip or clear it with null. The person holding this phone answered it. */
export const saveAnswer = createServerFn({ method: "POST" })
  .validator(
    z
      .object({ key: z.string(), answer: z.string().nullable() })
      .strict()
      .refine((a) => ask(a.key) !== undefined, "not a question in facts.yaml")
      .refine((a) => a.answer === null || isAnswer(a.key, a.answer), "not an answer to that question")
  )
  .handler(({ data }) => {
    const db = getDb();
    const { question, about } = ask(data.key)!;
    const id = personId();
    const answeredBy = id && new PeopleRepo(db).get(id) ? id : null;
    return new FactsRepo(db).answer({ question: question.id, about, value: data.answer, answeredBy });
  });
