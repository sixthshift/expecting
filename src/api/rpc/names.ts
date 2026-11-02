// The names game. Every call is as the person holding this phone: the server
// only ever returns their own votes, and the shortlist.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NamesRepo } from "../../db/models/names/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import type { ISODate } from "../../lib/dates";
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

/**
 * Superlike a name: on the shortlist without waiting for the other, one a day (`day`, the phone's date,
 * so the day turns over at its midnight). A name not in the game must be in the deck.
 */
export const superlikeName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), name: z.string().min(1).max(60), day: z.iso.date() }).strict())
  .handler(async ({ data }) => {
    const repo = new NamesRepo(getDb());
    const me = player();
    let name = data.name;
    if (!repo.has(name)) {
      const { inDeck } = await import("../../lib/nameDeck");
      const entry = inDeck(name);
      if (!entry) throw Response.json({ error: "That name isn't in the deck" }, { status: 400 });
      name = entry.name;
    }
    if (repo.superlike(name, me, data.day as ISODate, madeAt(), data.id) === null)
      throw Response.json({ error: "Today's superlike is used. Another tomorrow." }, { status: 409 });
  });

/** Take a name off the shortlist, for either of you: out of the game, and not dealt again. */
export const takeOffName = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => {
    player();
    new NamesRepo(getDb()).takeOff(data.id, madeAt());
  });

/** The names game, as this phone's person sees it. */
export type Names = Awaited<ReturnType<typeof getNames>>;
export const namesQuery = queryOptions({ queryKey: ["names"], queryFn: () => getNames() });

/**
 * The names game's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is
 * sent when it can be. A like can't show a new match until it's sent: only the server knows the other's.
 * A superlike can: it's on the shortlist whatever the other thinks.
 */
export const namesSaves = {
  addName: save({
    key: "addName",
    query: namesQuery.queryKey,
    send: (data: { id: string; name: string }, made) => addName({ data, headers: stamped(made) }),
    apply: (view: Names, { id, name }) => {
      const tidy = tidyName(name);
      // Typed again after it was taken off the shortlist, it's back in the game.
      const off = view.off.filter((n) => n.name.toLowerCase() !== tidy.toLowerCase());
      const same = view.names.find((n) => n.id === id || n.name.toLowerCase() === tidy.toLowerCase());
      if (same) return { ...view, off, names: view.names.map((n) => (n === same ? { ...n, mine: true } : n)) };
      return { ...view, off, names: [...view.names, { id, name: tidy, mine: true, deck: false }] };
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
  superlikeName: save({
    key: "superlikeName",
    query: namesQuery.queryKey,
    send: (data: { id: string; name: string; day: ISODate }, made) => superlikeName({ data, headers: stamped(made) }),
    apply: (view: Names, { id, name, day }) => {
      const key = name.toLowerCase();
      const same = view.names.find((n) => n.id === id || n.name.toLowerCase() === key);
      const card = same ?? { id, name, mine: true, deck: true };
      const names = same ? view.names.map((n) => (n === same ? { ...n, mine: true } : n)) : [...view.names, card];
      const listed = view.shortlist.some((n) => n.name.toLowerCase() === key);
      const shortlist = listed
        ? view.shortlist.map((n) => (n.name.toLowerCase() === key ? { ...n, star: true } : n))
        : [...view.shortlist, { id: card.id, name: card.name, star: true }];
      return { ...view, names, shortlist, superliked: { name: card.name, on: day } };
    },
  }),
  unvoteName: save({
    key: "unvoteName",
    query: namesQuery.queryKey,
    send: (data: { name: string }, made) => unvoteName({ data, headers: stamped(made) }),
    apply: (view: Names, { name }) => {
      const key = name.toLowerCase();
      // Undoing today's superlike gives it back, and takes the name off the shortlist until the server says otherwise.
      const wasSuper = view.superliked?.name.toLowerCase() === key;
      return {
        ...view,
        names: view.names.map((n) => (n.name.toLowerCase() === key ? { ...n, mine: null } : n)),
        shortlist: wasSuper ? view.shortlist.filter((n) => n.name.toLowerCase() !== key) : view.shortlist,
        superliked: wasSuper ? null : view.superliked,
      };
    },
  }),
  takeOffName: save({
    key: "takeOffName",
    query: namesQuery.queryKey,
    send: (data: { id: string }, made) => takeOffName({ data, headers: stamped(made) }),
    apply: (view: Names, { id }) => {
      const gone = view.shortlist.find((n) => n.id === id);
      if (!gone) return view;
      return { ...view, shortlist: view.shortlist.filter((n) => n.id !== id), off: [...view.off, { id, name: gone.name }] };
    },
  }),
};

/** namesQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useNamesQuery<TData = Names>(options?: Omit<UseSuspenseQueryOptions<Names, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...namesQuery, ...options } as UseSuspenseQueryOptions<Names, Error, TData, string[]>);
}
