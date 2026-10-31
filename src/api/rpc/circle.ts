// Your people (src/lib/circle.ts): who they are, what each view sets on them,
// what they gave, and the words for the birth. Shared by both of you, each
// change saying who made it.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CircleRepo } from "../../db/models/circle/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { type Circle, HEARS, type Hears, type PersonPatch, patched, VISITS, type Visit } from "../../lib/circle";
import { isISODate } from "../../lib/dates";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

/** Words of up to `max` characters, trimmed; empty is none. */
const words = (max: number) =>
  z
    .string()
    .max(max)
    .nullable()
    .transform((w) => w?.trim() || null);

const name = z
  .string()
  .transform((t) => t.trim())
  .refine((t) => t.length > 0 && t.length <= 80, "a name of 1–80 characters");

const what = z
  .string()
  .transform((t) => t.trim())
  .refine((t) => t.length > 0 && t.length <= 200, "a gift of 1–200 characters");

const id = z.object({ id: z.uuid() }).strict();

export const getCircle = createServerFn({ method: "GET" }).handler(() => new CircleRepo(getDb()).all());

export const addCirclePerson = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), name, note: words(200) }).strict())
  .handler(({ data }) => new CircleRepo(getDb()).addPerson(data, known(personId()), madeAt()));

export const renameCirclePerson = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), name, note: words(200) }).strict())
  .handler(({ data }) => new CircleRepo(getDb()).renamePerson(data.id, data));

const patch = z
  .object({
    visit: z.enum(Object.keys(VISITS) as [Visit, ...Visit[]]).nullable(),
    hears: z.enum(Object.keys(HEARS) as [Hears, ...Hears[]]).nullable(),
    help: words(200),
    mealDay: z.string().refine(isISODate, "a day, YYYY-MM-DD").nullable(),
  })
  .partial()
  .strict();

export const setCirclePerson = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), patch }).strict())
  .handler(({ data }) => new CircleRepo(getDb()).setPerson(data.id, data.patch as PersonPatch));

export const deleteCirclePerson = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new CircleRepo(getDb()).deletePerson(data.id));

export const addGift = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), personId: z.uuid(), what }).strict())
  .handler(({ data }) => {
    const repo = new CircleRepo(getDb());
    // Someone deleted on the other phone: the gift goes with them.
    if (!repo.person(data.personId)) return;
    repo.addGift(data, known(personId()), madeAt());
  });

export const thankGift = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), thanked: z.boolean() }).strict())
  .handler(({ data }) => new CircleRepo(getDb()).thankGift(data.id, data.thanked, madeAt()));

export const deleteGift = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new CircleRepo(getDb()).deleteGift(data.id));

export const setAnnouncement = createServerFn({ method: "POST" })
  .validator(z.object({ body: z.string().max(2000) }).strict())
  .handler(({ data }) => new CircleRepo(getDb()).setAnnouncement(data.body, known(personId()), madeAt()));

export type { Circle };
export const circleQuery = queryOptions({ queryKey: ["circle"], queryFn: () => getCircle() });

/** Your people's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const circleSaves = {
  addCirclePerson: save({
    key: "addCirclePerson",
    query: circleQuery.queryKey,
    send: (data: { id: string; name: string; note: string | null }, made) => addCirclePerson({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id, name, note }, made) =>
      circle.people.some((p) => p.id === id)
        ? circle
        : {
            ...circle,
            people: [
              ...circle.people,
              { id, name: name.trim(), note: note?.trim() || null, visit: null, hears: null, help: null, mealDay: null, by: made.by, createdAt: made.at },
            ],
          },
  }),
  renameCirclePerson: save({
    key: "renameCirclePerson",
    query: circleQuery.queryKey,
    send: (data: { id: string; name: string; note: string | null }, made) => renameCirclePerson({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id, name, note }) => ({
      ...circle,
      people: circle.people.map((p) => (p.id === id ? { ...p, name: name.trim(), note: note?.trim() || null } : p)),
    }),
  }),
  setCirclePerson: save({
    key: "setCirclePerson",
    query: circleQuery.queryKey,
    send: (data: { id: string; patch: PersonPatch }, made) => setCirclePerson({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id, patch }) => ({ ...circle, people: circle.people.map((p) => (p.id === id ? patched(p, patch) : p)) }),
  }),
  deleteCirclePerson: save({
    key: "deleteCirclePerson",
    query: circleQuery.queryKey,
    send: (data: { id: string }, made) => deleteCirclePerson({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id }) => ({ ...circle, people: circle.people.filter((p) => p.id !== id), gifts: circle.gifts.filter((g) => g.personId !== id) }),
  }),
  addGift: save({
    key: "addGift",
    query: circleQuery.queryKey,
    send: (data: { id: string; personId: string; what: string }, made) => addGift({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id, personId, what }, made) =>
      circle.gifts.some((g) => g.id === id) || !circle.people.some((p) => p.id === personId)
        ? circle
        : { ...circle, gifts: [...circle.gifts, { id, personId, what: what.trim(), thankedAt: null, by: made.by, createdAt: made.at }] },
  }),
  thankGift: save({
    key: "thankGift",
    query: circleQuery.queryKey,
    send: (data: { id: string; thanked: boolean }, made) => thankGift({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id, thanked }, made) => ({
      ...circle,
      gifts: circle.gifts.map((g) => (g.id !== id || thanked === (g.thankedAt !== null) ? g : { ...g, thankedAt: thanked ? made.at : null })),
    }),
  }),
  deleteGift: save({
    key: "deleteGift",
    query: circleQuery.queryKey,
    send: (data: { id: string }, made) => deleteGift({ data, headers: stamped(made) }),
    apply: (circle: Circle, { id }) => ({ ...circle, gifts: circle.gifts.filter((g) => g.id !== id) }),
  }),
  setAnnouncement: save({
    key: "setAnnouncement",
    query: circleQuery.queryKey,
    send: (data: { body: string }, made) => setAnnouncement({ data, headers: stamped(made) }),
    apply: (circle: Circle, { body }, made) => ({
      ...circle,
      announcement: body.trim() ? { body: body.trim(), by: made.by, updatedAt: made.at } : null,
    }),
  }),
};

/** circleQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useCircle<TData = Circle>(options?: Omit<UseSuspenseQueryOptions<Circle, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...circleQuery, ...options } as UseSuspenseQueryOptions<Circle, Error, TData, string[]>);
}
