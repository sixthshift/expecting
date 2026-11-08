// The firsts (src/lib/journal/firsts.ts): marked on their day by either of you,
// and each of you's own words for one. Shared: both of you see both answers.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FirstsRepo } from "../../db/models/firsts/repo";
import { isISODate } from "../../lib/dates";
import { FIRST_KEYS, type FirstKey, type FirstMark } from "../../lib/journal/firsts";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const key = z.enum(FIRST_KEYS);

const listFirsts = createServerFn({ method: "GET" }).handler(() => new FirstsRepo(getDb()).list());

const markFirst = createServerFn({ method: "POST" })
  .validator(z.object({ key, day: z.string().refine(isISODate, "Not a date") }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).mark(data.key, data.day, personId(), madeAt()));

const unmarkFirst = createServerFn({ method: "POST" })
  .validator(z.object({ key }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).unmark(data.key));

const setFirstWords = createServerFn({ method: "POST" })
  .validator(z.object({ key, body: z.string().max(10_000) }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).setWords(data.key, personId(), data.body, madeAt()));

export type Firsts = FirstMark[];
export const firstsQuery = queryOptions({ queryKey: ["firsts"], queryFn: (): Promise<Firsts> => listFirsts() });

/** The firsts' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const firstsSaves = {
  markFirst: save({
    key: "markFirst",
    query: firstsQuery.queryKey,
    send: (data: { key: FirstKey; day: string }, made) => markFirst({ data, headers: stamped(made) }),
    apply: (firsts: Firsts, { key, day }, made) =>
      firsts.some((f) => f.key === key)
        ? firsts.map((f) => (f.key === key ? { ...f, day } : f))
        : [...firsts, { key, day, by: made.by, createdAt: made.at, words: [] }],
  }),
  unmarkFirst: save({
    key: "unmarkFirst",
    query: firstsQuery.queryKey,
    send: (data: { key: FirstKey }, made) => unmarkFirst({ data, headers: stamped(made) }),
    apply: (firsts: Firsts, { key }) => firsts.filter((f) => f.key !== key),
  }),
  setFirstWords: save({
    key: "setFirstWords",
    query: firstsQuery.queryKey,
    send: (data: { key: FirstKey; body: string }, made) => setFirstWords({ data, headers: stamped(made) }),
    apply: (firsts: Firsts, { key, body }, made) =>
      firsts.map((f) => {
        if (f.key !== key || f.day === null || made.by === null) return f;
        const others = f.words.filter((w) => w.by !== made.by);
        const words = body.trim();
        return { ...f, words: words ? [...others, { by: made.by, body: words, editedAt: made.at }] : others };
      }),
  }),
};

export const useFirstsQuery = queryHook(firstsQuery);
