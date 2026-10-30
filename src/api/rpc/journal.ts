// The Journal: what happens, kept. Shared, and either of you can change
// anything in it; each entry says who wrote it and who changed it last.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { JournalRepo } from "../../db/models/journal/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { isISODate } from "../../lib/dates";
import { type JournalEntry, TIME } from "../../lib/journal";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const note = z
  .object({
    id: z.uuid(),
    day: z.string().refine(isISODate, "Not a date"),
    time: z.string().regex(TIME).nullable(),
    body: z.string().trim().min(1).max(10_000),
  })
  .strict();

export const listJournal = createServerFn({ method: "GET" }).handler(() => new JournalRepo(getDb()).list());

export const addNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).add(data, known(personId()), madeAt()));

export const editNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).edit(data, known(personId()), madeAt()));

export const restoreNote = createServerFn({ method: "POST" })
  .validator(
    note
      .extend({
        kind: z.literal("note"),
        by: z.uuid().nullable(),
        createdAt: z.iso.datetime(),
        editedBy: z.uuid().nullable(),
        editedAt: z.iso.datetime().nullable(),
      })
      .strict()
  )
  .handler(({ data }) => new JournalRepo(getDb()).restore({ ...data, by: known(data.by), editedBy: known(data.editedBy) }));

export const deleteNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).delete(data.id));

/** Everything kept in the Journal. */
export type Journal = Awaited<ReturnType<typeof listJournal>>;
export const journalQuery = queryOptions({ queryKey: ["journal"], queryFn: () => listJournal() });

type NoteInput = { id: string; day: string; time: string | null; body: string };

/** The Journal's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const journalSaves = {
  addNote: save({
    key: "addNote",
    query: journalQuery.queryKey,
    send: (data: NoteInput, made) => addNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, input, made) =>
      journal.some((e) => e.id === input.id)
        ? journal
        : [...journal, { ...input, kind: "note" as const, body: input.body.trim(), by: made.by, createdAt: made.at, editedBy: null, editedAt: null }],
  }),
  editNote: save({
    key: "editNote",
    query: journalQuery.queryKey,
    send: (data: NoteInput, made) => editNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id, day, time, body }, made) =>
      journal.map((e) => (e.id === id ? { ...e, day, time, body: body.trim(), editedBy: made.by, editedAt: made.at } : e)),
  }),
  restoreNote: save({
    key: "restoreNote",
    query: journalQuery.queryKey,
    send: (data: JournalEntry, made) => restoreNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, entry) => (journal.some((e) => e.id === entry.id) ? journal : [...journal, entry]),
  }),
  deleteNote: save({
    key: "deleteNote",
    query: journalQuery.queryKey,
    send: (data: { id: string }, made) => deleteNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id }) => journal.filter((e) => e.id !== id),
  }),
};

/** journalQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useJournal<TData = Journal>(options?: Omit<UseSuspenseQueryOptions<Journal, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...journalQuery, ...options } as UseSuspenseQueryOptions<Journal, Error, TData, string[]>);
}
