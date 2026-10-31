import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBuiltInLineId } from "../../content";
import { type Lists, ListsRepo } from "../../db/models/lists/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { HOWS, type How, LINE_STATES, type LineState, listOf, type Mark } from "../../lib/lists";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const title = z
  .string()
  .transform((t) => t.trim())
  .refine((t) => t.length > 0 && t.length <= 200, "a title of 1–200 characters");

const id = z.object({ id: z.uuid() }).strict();

/** A list that's there: a built-in one, or one of yours. */
function hasList(listId: string): boolean {
  return listOf(listId) !== undefined || new ListsRepo(getDb()).hasList(listId);
}

/** A section of a built-in list, or none; a list of your own has none. */
function fitsSection(listId: string, section: string | null): boolean {
  return section === null || section in (listOf(listId)?.sections ?? {});
}

export const getLists = createServerFn({ method: "GET" }).handler(() => new ListsRepo(getDb()).all());

export const addList = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), title }).strict())
  .handler(({ data }) => new ListsRepo(getDb()).addList(data, known(personId()), madeAt()));

export const renameList = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), title }).strict())
  .handler(({ data }) => new ListsRepo(getDb()).renameList(data.id, data.title));

export const deleteList = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new ListsRepo(getDb()).deleteList(data.id));

export const addLine = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), listId: z.string().min(1).max(100), title, section: z.string().max(100).nullable() }).strict())
  .handler(({ data }) => {
    if (!hasList(data.listId)) throw new Error(`No list ${data.listId}`);
    if (!fitsSection(data.listId, data.section)) throw new Error(`No section ${data.section} on ${data.listId}`);
    return new ListsRepo(getDb()).addLine(data, known(personId()), madeAt());
  });

export const changeLine = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), title, section: z.string().max(100).nullable() }).strict())
  .handler(({ data }) => {
    const repo = new ListsRepo(getDb());
    const line = repo.all().ownLines.find((l) => l.id === data.id);
    if (!line) return;
    if (!fitsSection(line.listId, data.section)) throw new Error(`No section ${data.section} on ${line.listId}`);
    repo.changeLine(data.id, data);
  });

export const deleteLine = createServerFn({ method: "POST" })
  .validator(id)
  .handler(({ data }) => new ListsRepo(getDb()).deleteLine(data.id));

const markInput = z
  .object({
    lineId: z.string().min(1).max(200),
    state: z.enum(LINE_STATES).nullable(),
    how: z.enum(Object.keys(HOWS) as [How, ...How[]]).nullable(),
    note: z.string().max(500).nullable(),
  })
  .strict();

export const markLine = createServerFn({ method: "POST" })
  .validator(markInput)
  .handler(({ data }) => {
    const repo = new ListsRepo(getDb());
    if (!isBuiltInLineId(data.lineId) && !repo.hasLine(data.lineId)) throw new Error(`No line ${data.lineId}`);
    repo.mark(data.lineId, data, known(personId()), madeAt());
  });

export type { Lists };
export const listsQuery = queryOptions({ queryKey: ["lists"], queryFn: () => getLists() });

/** A line's mark as the repo keeps it: how only once got, words trimmed, and none at all with neither. */
function marked(
  marks: Lists["marks"],
  lineId: string,
  input: { state: LineState | null; how: How | null; note: string | null },
  by: string | null,
  at: string
) {
  const { [lineId]: _, ...rest } = marks;
  const note = input.note?.trim() || null;
  if (input.state === null && note === null) return rest;
  const mark: Mark = { lineId, state: input.state, how: input.state === "got" ? input.how : null, note, by, updatedAt: at };
  return { ...rest, [lineId]: mark };
}

/** The lists' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const listsSaves = {
  addList: save({
    key: "addList",
    query: listsQuery.queryKey,
    send: (data: { id: string; title: string }, made) => addList({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id, title }, made) =>
      lists.ownLists.some((l) => l.id === id)
        ? lists
        : { ...lists, ownLists: [...lists.ownLists, { id, title: title.trim(), by: made.by, createdAt: made.at }] },
  }),
  renameList: save({
    key: "renameList",
    query: listsQuery.queryKey,
    send: (data: { id: string; title: string }, made) => renameList({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id, title }) => ({ ...lists, ownLists: lists.ownLists.map((l) => (l.id === id ? { ...l, title: title.trim() } : l)) }),
  }),
  deleteList: save({
    key: "deleteList",
    query: listsQuery.queryKey,
    send: (data: { id: string }, made) => deleteList({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id }) => {
      const gone = new Set(lists.ownLines.filter((l) => l.listId === id).map((l) => l.id));
      return {
        ownLists: lists.ownLists.filter((l) => l.id !== id),
        ownLines: lists.ownLines.filter((l) => !gone.has(l.id)),
        marks: Object.fromEntries(Object.entries(lists.marks).filter(([lineId]) => !gone.has(lineId))),
      };
    },
  }),
  addLine: save({
    key: "addLine",
    query: listsQuery.queryKey,
    send: (data: { id: string; listId: string; title: string; section: string | null }, made) => addLine({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id, listId, title, section }, made) =>
      lists.ownLines.some((l) => l.id === id)
        ? lists
        : { ...lists, ownLines: [...lists.ownLines, { id, listId, title: title.trim(), section, by: made.by, createdAt: made.at }] },
  }),
  changeLine: save({
    key: "changeLine",
    query: listsQuery.queryKey,
    send: (data: { id: string; title: string; section: string | null }, made) => changeLine({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id, title, section }) => ({
      ...lists,
      ownLines: lists.ownLines.map((l) => (l.id === id ? { ...l, title: title.trim(), section } : l)),
    }),
  }),
  deleteLine: save({
    key: "deleteLine",
    query: listsQuery.queryKey,
    send: (data: { id: string }, made) => deleteLine({ data, headers: stamped(made) }),
    apply: (lists: Lists, { id }) => {
      const { [id]: _, ...marks } = lists.marks;
      return { ...lists, ownLines: lists.ownLines.filter((l) => l.id !== id), marks };
    },
  }),
  markLine: save({
    key: "markLine",
    query: listsQuery.queryKey,
    send: (data: { lineId: string; state: LineState | null; how: How | null; note: string | null }, made) => markLine({ data, headers: stamped(made) }),
    apply: (lists: Lists, input, made) => ({ ...lists, marks: marked(lists.marks, input.lineId, input, made.by, made.at) }),
  }),
};

/** listsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useLists<TData = Lists>(options?: Omit<UseSuspenseQueryOptions<Lists, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...listsQuery, ...options } as UseSuspenseQueryOptions<Lists, Error, TData, string[]>);
}
