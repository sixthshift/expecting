// The names game. Every call is as the person holding this phone: the server
// only ever returns their own votes, and the matches.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NamesRepo } from "../../db/models/names/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { tidyName } from "../../lib/names";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Who's playing: the person this phone says it is. A phone that hasn't said can't vote. */
function player(): string {
  const id = personId();
  if (!id || !new PeopleRepo(getDb()).get(id)) throw new Error("Say who's holding this phone first");
  return id;
}

export const getNames = createServerFn({ method: "GET" }).handler(() => new NamesRepo(getDb()).view(player()));

export const addName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), name: z.string().transform(tidyName).pipe(z.string().min(1).max(60)) }).strict())
  .handler(({ data }) => {
    const repo = new NamesRepo(getDb());
    const me = player();
    const at = madeAt();
    const id = repo.add(data.name, me, at, data.id);
    // Whoever adds a name likes it.
    repo.vote(id, me, true, at);
  });

export const voteName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), liked: z.boolean() }).strict())
  .handler(({ data }) => new NamesRepo(getDb()).vote(data.id, player(), data.liked, madeAt()));

/** Like or pass a name from the deck; one the deck doesn't have is turned away. */
export const swipeName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), name: z.string().max(60), liked: z.boolean() }).strict())
  .handler(async ({ data }) => {
    // Loaded here, on the server only: the deck isn't for the app's own bundle.
    const { inDeck } = await import("../../lib/nameDeck");
    const entry = inDeck(data.name);
    if (!entry) throw Response.json({ error: "That name isn't in the deck" }, { status: 400 });
    new NamesRepo(getDb()).swipe(entry.name, player(), data.liked, madeAt(), data.id);
  });

/** Take back your vote on a name: the last swipe, undone. */
export const unvoteName = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1).max(60) }).strict())
  .handler(({ data }) => new NamesRepo(getDb()).unvote(data.name, player()));

export const removeName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => {
    player();
    new NamesRepo(getDb()).remove(data.id);
  });

/** The names game, as this phone's person sees it. */
export type Names = Awaited<ReturnType<typeof getNames>>;
export const namesQuery = queryOptions({ queryKey: ["names"], queryFn: () => getNames() });

/**
 * The names game's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is
 * sent when it can be. A vote can't show a new match until it's sent: only the server knows the other's.
 */
export const namesSaves = {
  addName: save({
    key: "addName",
    query: namesQuery.queryKey,
    send: (data: { id: string; name: string }, made) => addName({ data, headers: stamped(made) }),
    apply: (view: Names, { id, name }) => {
      const tidy = tidyName(name);
      const same = view.names.find((n) => n.id === id || n.name.toLowerCase() === tidy.toLowerCase());
      if (same) return { ...view, names: view.names.map((n) => (n === same ? { ...n, mine: true } : n)) };
      return { ...view, names: [...view.names, { id, name: tidy, mine: true, deck: false }] };
    },
  }),
  voteName: save({
    key: "voteName",
    query: namesQuery.queryKey,
    send: (data: { id: string; liked: boolean }, made) => voteName({ data, headers: stamped(made) }),
    apply: (view: Names, { id, liked }) => ({ ...view, names: view.names.map((n) => (n.id === id ? { ...n, mine: liked } : n)) }),
  }),
  swipeName: save({
    key: "swipeName",
    query: namesQuery.queryKey,
    send: (data: { id: string; name: string; liked: boolean }, made) => swipeName({ data, headers: stamped(made) }),
    apply: (view: Names, { id, name, liked }) => {
      const same = view.names.find((n) => n.id === id || n.name.toLowerCase() === name.toLowerCase());
      if (same) return { ...view, names: view.names.map((n) => (n === same ? { ...n, mine: liked } : n)) };
      return { ...view, names: [...view.names, { id, name, mine: liked, deck: true }] };
    },
  }),
  unvoteName: save({
    key: "unvoteName",
    query: namesQuery.queryKey,
    send: (data: { name: string }, made) => unvoteName({ data, headers: stamped(made) }),
    apply: (view: Names, { name }) => ({
      ...view,
      names: view.names.map((n) => (n.name.toLowerCase() === name.toLowerCase() ? { ...n, mine: null } : n)),
    }),
  }),
  removeName: save({
    key: "removeName",
    query: namesQuery.queryKey,
    send: (data: { id: string }, made) => removeName({ data, headers: stamped(made) }),
    apply: (view: Names, { id }) => ({ ...view, names: view.names.filter((n) => n.id !== id), matches: view.matches.filter((m) => m.id !== id) }),
  }),
};

/** namesQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useNames<TData = Names>(options?: Omit<UseSuspenseQueryOptions<Names, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...namesQuery, ...options } as UseSuspenseQueryOptions<Names, Error, TData, string[]>);
}
