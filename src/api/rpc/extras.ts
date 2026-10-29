// The extras the household has turned on or off (src/features/settings/model/extras.data.ts), each
// with who changed it and when.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { EXTRAS, extra } from "../../features/settings/model/extras";
import { getDb } from "../../server/core/db";
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
    return data.map((c) => repo.set({ ...c, changedBy }));
  });

export type Choices = Awaited<ReturnType<typeof getExtras>>;
export const extrasQuery = queryOptions({ queryKey: ["extras"], queryFn: () => getExtras() });

/** extrasQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useExtras<TData = Choices>(options?: Omit<UseSuspenseQueryOptions<Choices, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...extrasQuery, ...options } as UseSuspenseQueryOptions<Choices, Error, TData, string[]>);
}
