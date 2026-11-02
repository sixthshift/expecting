// What you've read in the Library: each of you your own, as the person holding
// this phone. Opening an entry marks it; a private one is never marked (the
// page doesn't send it, and the privacy middleware would refuse it).

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInItemId } from "../../content";
import { PeopleRepo } from "../../db/models/people/repo";
import { ReadsRepo } from "../../db/models/reads/repo";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Item id to when you first opened it. */
export type Reads = Record<string, string>;

/** Someone still here, by id; else nobody. */
function me(): string | null {
  const id = personId();
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

/** What this phone's person has read; nothing for a phone that hasn't said who's holding it. */
export const getReads = createServerFn({ method: "GET" }).handler((): Reads => {
  const id = me();
  return id ? new ReadsRepo(getDb()).reads(id) : {};
});

/** This phone's person opened an entry, when the save was made. */
export const markRead = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.string().min(1).max(200).refine(isBuiltInItemId, "an entry in content/items") }).strict())
  .handler(({ data }) => {
    const id = me();
    if (id) new ReadsRepo(getDb()).markRead(id, data.itemId, madeAt().toISOString());
  });

export const readsQuery = queryOptions({ queryKey: ["reads"], queryFn: () => getReads() });

/** Reading, through the outbox (src/app/model/outbox.ts): marked at once, and sent when it can be. */
export const readsSaves = {
  markRead: save({
    key: "markRead",
    query: readsQuery.queryKey,
    send: (data: { itemId: string }, made) => markRead({ data, headers: stamped(made) }),
    apply: (reads: Reads, { itemId }, made) => (made.by === null || reads[itemId] ? reads : { ...reads, [itemId]: made.at }),
  }),
};

/** readsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useReadsQuery<TData = Reads>(options?: Omit<UseSuspenseQueryOptions<Reads, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...readsQuery, ...options } as UseSuspenseQueryOptions<Reads, Error, TData, string[]>);
}
