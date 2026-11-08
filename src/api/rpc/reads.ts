// What you've read in the Library: each of you your own, as the person holding
// this phone. Opening an entry marks it; a private one is never marked (the
// page doesn't send it, and the privacy middleware would refuse it).

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInItemId } from "../../content";
import { ReadsRepo } from "../../db/models/reads/repo";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

/** Item id to when you first opened it. */
export type Reads = Record<string, string>;

/** What this phone's person has read. */
const getReads = createServerFn({ method: "GET" }).handler((): Reads => new ReadsRepo(getDb()).reads(personId()));

/** This phone's person opened an entry, when the save was made. */
const markRead = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.string().min(1).max(200).refine(isBuiltInItemId, "an entry in content/items") }).strict())
  .handler(({ data }) => new ReadsRepo(getDb()).markRead(personId(), data.itemId, madeAt().toISOString()));

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

export const useReadsQuery = queryHook(readsQuery);
