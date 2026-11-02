// The extras you've turned on or off (src/features/settings/model/extras.data.ts), each
// with who changed it and when.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { EXTRAS, extra } from "../../features/settings/model/extras";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** The extras someone has decided on, for extras still offered. */
export const getExtras = createServerFn({ method: "GET" }).handler(() => new ExtrasRepo(getDb()).list().filter((c) => extra(c.id) !== undefined));

/** Turn extras on or off, several at once (onboarding's choice). The person holding this phone changed them. */
export const setExtras = createServerFn({ method: "POST" })
  .validator(
    z.array(z.object({ id: z.string().refine((id) => extra(id) !== undefined, "not an extra in extras.data.ts"), on: z.boolean() }).strict()).max(EXTRAS.length)
  )
  .handler(({ data }) => {
    const db = getDb();
    const id = personId();
    const changedBy = id && new PeopleRepo(db).get(id) ? id : null;
    const repo = new ExtrasRepo(db);
    const at = madeAt();
    return data.map((c) => repo.set({ ...c, changedBy }, at));
  });

export type Choices = Awaited<ReturnType<typeof getExtras>>;
export const extrasQuery = queryOptions({ queryKey: ["extras"], queryFn: () => getExtras() });

/** The extras' save, through the outbox (src/app/model/outbox.ts): it shows at once, and is sent when it can be. */
export const extrasSaves = {
  setExtras: save({
    key: "setExtras",
    query: extrasQuery.queryKey,
    send: (data: { id: string; on: boolean }[], made) => setExtras({ data, headers: stamped(made) }),
    apply: (choices: Choices, changes, made) => [
      ...choices.filter((c) => !changes.some((n) => n.id === c.id)),
      ...changes.map((n) => ({ id: n.id, on: n.on, changedBy: made.by, changedAt: made.at })),
    ],
  }),
};

/** extrasQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useExtrasQuery<TData = Choices>(options?: Omit<UseSuspenseQueryOptions<Choices, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...extrasQuery, ...options } as UseSuspenseQueryOptions<Choices, Error, TData, string[]>);
}
