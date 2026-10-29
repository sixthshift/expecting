// The names game. Every call is as the person holding this phone: the server
// only ever returns their own votes, and the matches.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NamesRepo } from "../../db/models/names/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { tidyName } from "../../lib/names";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

/** Who's playing: the person this phone says it is. A phone that hasn't said can't vote. */
function player(): string {
  const id = personId();
  if (!id || !new PeopleRepo(getDb()).get(id)) throw new Error("Say who's holding this phone first");
  return id;
}

export const getNames = createServerFn({ method: "GET" }).handler(() => new NamesRepo(getDb()).view(player()));

export const addName = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().transform(tidyName).pipe(z.string().min(1).max(60)) }).strict())
  .handler(({ data }) => {
    const repo = new NamesRepo(getDb());
    const me = player();
    const id = repo.add(data.name, me);
    // Whoever adds a name likes it.
    repo.vote(id, me, true);
  });

export const voteName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), liked: z.boolean() }).strict())
  .handler(({ data }) => new NamesRepo(getDb()).vote(data.id, player(), data.liked));

export const removeName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => {
    player();
    new NamesRepo(getDb()).remove(data.id);
  });

/** The names game, as this phone's person sees it. */
export type Names = Awaited<ReturnType<typeof getNames>>;
export const namesQuery = queryOptions({ queryKey: ["names"], queryFn: () => getNames() });

/** namesQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useNames<TData = Names>(options?: Omit<UseSuspenseQueryOptions<Names, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...namesQuery, ...options } as UseSuspenseQueryOptions<Names, Error, TData, string[]>);
}
