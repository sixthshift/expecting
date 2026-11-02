// How you're feeling. The step is shared, so either of you sees the other's;
// the words and the note are only ever sent to the phone of the person they're
// about, and only they can change or delete one (src/lib/feelings.ts).

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FeelingsRepo, type NewFeeling } from "../../db/models/feelings/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { isISODate } from "../../lib/dates";
import { type Feeling, isOwn, type OwnFeeling, STEPS, WORDS } from "../../lib/feelings";
import { TIME } from "../../lib/journal";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** The person this phone says it is, if still here; else nobody. */
function asker(): string | null {
  const id = personId();
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

/** Whose feeling this is: a phone that hasn't said who's holding it can't keep one. */
function me(): string {
  const id = asker();
  if (!id) throw new Error("Say who's holding this phone first");
  return id;
}

const feeling = z
  .object({
    id: z.uuid(),
    day: z.string().refine(isISODate, "Not a date"),
    time: z.string().regex(TIME).nullable(),
    step: z.enum(STEPS),
    words: z
      .array(z.enum(WORDS))
      .max(WORDS.length)
      .transform((words) => [...new Set(words)]),
    note: z.string().max(10_000).nullable(),
  })
  .strict();

export const listFeelings = createServerFn({ method: "GET" }).handler(() => new FeelingsRepo(getDb()).list(asker()));

export const addFeeling = createServerFn({ method: "POST" })
  .validator(feeling)
  .handler(({ data }) => new FeelingsRepo(getDb()).add(data, me(), madeAt()));

export const changeFeeling = createServerFn({ method: "POST" })
  .validator(feeling)
  .handler(({ data }) => {
    if (!new FeelingsRepo(getDb()).change(data, me())) throw new Error("Only the person it's about can change it");
  });

export const deleteFeeling = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new FeelingsRepo(getDb()).delete(data.id, me()));

/** Every feeling, as this phone's person may see it: their own whole, the other's step only. */
export type Feelings = (Feeling | OwnFeeling)[];
export const feelingsQuery = queryOptions({ queryKey: ["feelings"], queryFn: (): Promise<Feelings> => listFeelings() });

type FeelingInput = NewFeeling;

/** A note as kept: trimmed, and nothing at all rather than blank. */
const noteOf = (note: string | null) => note?.trim() || null;
const wordsOf = (words: FeelingInput["words"]) => [...new Set(words)];

/** The feelings' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const feelingsSaves = {
  addFeeling: save({
    key: "addFeeling",
    query: feelingsQuery.queryKey,
    send: (data: FeelingInput, made) => addFeeling({ data, headers: stamped(made) }),
    apply: (feelings: Feelings, input, made) =>
      feelings.some((f) => f.id === input.id)
        ? feelings
        : [...feelings, { ...input, words: wordsOf(input.words), note: noteOf(input.note), by: made.by ?? "", createdAt: made.at }],
  }),
  changeFeeling: save({
    key: "changeFeeling",
    query: feelingsQuery.queryKey,
    send: (data: FeelingInput, made) => changeFeeling({ data, headers: stamped(made) }),
    apply: (feelings: Feelings, { id, day, time, step, words, note }) =>
      feelings.map((f) => (f.id === id && isOwn(f) ? { ...f, day, time, step, words: wordsOf(words), note: noteOf(note) } : f)),
  }),
  deleteFeeling: save({
    key: "deleteFeeling",
    query: feelingsQuery.queryKey,
    send: (data: { id: string }, made) => deleteFeeling({ data, headers: stamped(made) }),
    apply: (feelings: Feelings, { id }) => feelings.filter((f) => f.id !== id || !isOwn(f)),
  }),
};

/** feelingsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useFeelingsQuery<TData = Feelings>(options?: Omit<UseSuspenseQueryOptions<Feelings, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...feelingsQuery, ...options } as UseSuspenseQueryOptions<Feelings, Error, TData, string[]>);
}
