// The firsts (src/lib/firsts.ts): marked on their day by either of you, or a
// suggestion put aside, and each of you's own words for one. Shared: both of
// you see both answers.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FirstsRepo } from "../../db/models/firsts/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { isISODate } from "../../lib/dates";
import { FIRST_KEYS, type FirstKey, type FirstMark } from "../../lib/firsts";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** The person this phone says it is, if still here; else nobody. */
function asker(): string | null {
  const id = personId();
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const key = z.enum(FIRST_KEYS);

export const listFirsts = createServerFn({ method: "GET" }).handler(() => new FirstsRepo(getDb()).list());

export const markFirst = createServerFn({ method: "POST" })
  .validator(z.object({ key, day: z.string().refine(isISODate, "Not a date") }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).mark(data.key, data.day, asker(), madeAt()));

export const setFirstAside = createServerFn({ method: "POST" })
  .validator(z.object({ key }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).setAside(data.key, asker(), madeAt()));

export const unmarkFirst = createServerFn({ method: "POST" })
  .validator(z.object({ key }).strict())
  .handler(({ data }) => new FirstsRepo(getDb()).unmark(data.key));

export const setFirstWords = createServerFn({ method: "POST" })
  .validator(z.object({ key, body: z.string().max(10_000) }).strict())
  .handler(({ data }) => {
    const me = asker();
    if (!me) throw new Error("Say who's holding this phone first");
    new FirstsRepo(getDb()).setWords(data.key, me, data.body, madeAt());
  });

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
  setFirstAside: save({
    key: "setFirstAside",
    query: firstsQuery.queryKey,
    send: (data: { key: FirstKey }, made) => setFirstAside({ data, headers: stamped(made) }),
    apply: (firsts: Firsts, { key }, made) =>
      firsts.some((f) => f.key === key) ? firsts : [...firsts, { key, day: null, by: made.by, createdAt: made.at, words: [] }],
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

/** firstsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. */
export function useFirsts<TData = Firsts>(options?: Omit<UseSuspenseQueryOptions<Firsts, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...firstsQuery, ...options } as UseSuspenseQueryOptions<Firsts, Error, TData, string[]>);
}
