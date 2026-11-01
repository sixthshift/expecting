// The Journal: what happens, kept. Shared, and either of you can change
// anything in it; each entry says who wrote it and who changed it last.
// Notes (or letters to the baby), and movements: a movement's words are
// optional, and it may be marked as slower, weaker or stopped. And when each
// of you last opened the Journal, for "since you looked".

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
    /** A letter to the baby; a phone before letters sends a note without it. */
    kind: z.enum(["note", "letter"]).optional(),
    /** A letter from both of you; a phone before that sends a letter without it. */
    fromBoth: z.boolean().optional(),
  })
  .strict();

const movement = z
  .object({
    id: z.uuid(),
    day: z.string().refine(isISODate, "Not a date"),
    time: z.string().regex(TIME),
    body: z.string().trim().max(10_000),
    different: z.boolean(),
  })
  .strict();

/** What every entry keeps beside what was written: who and when. */
const kept = {
  by: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  editedBy: z.uuid().nullable(),
  editedAt: z.iso.datetime().nullable(),
};

export const listJournal = createServerFn({ method: "GET" }).handler(() => new JournalRepo(getDb()).list());

export const addNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).add(data, known(personId()), madeAt()));

export const editNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).edit(data, known(personId()), madeAt()));

// `different` defaults: a phone still running the build before movements sends a note without it.
export const restoreNote = createServerFn({ method: "POST" })
  .validator(
    note.extend({ kind: z.enum(["note", "letter"]), different: z.literal(false).default(false), fromBoth: z.boolean().default(false), ...kept }).strict()
  )
  .handler(({ data }) =>
    new JournalRepo(getDb()).restore({ ...data, fromBoth: data.kind === "letter" && data.fromBoth, by: known(data.by), editedBy: known(data.editedBy) })
  );

export const deleteNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).delete(data.id));

export const addMovement = createServerFn({ method: "POST" })
  .validator(movement)
  .handler(({ data }) => new JournalRepo(getDb()).addMovement(data, known(personId()), madeAt()));

export const editMovement = createServerFn({ method: "POST" })
  .validator(movement)
  .handler(({ data }) => new JournalRepo(getDb()).editMovement(data, known(personId()), madeAt()));

export const restoreMovement = createServerFn({ method: "POST" })
  .validator(movement.extend({ kind: z.literal("movement"), fromBoth: z.literal(false).default(false), ...kept }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).restore({ ...data, by: known(data.by), editedBy: known(data.editedBy) }));

export const deleteMovement = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).delete(data.id));

/** When this phone's person last opened the Journal; null if never, or for a phone that hasn't said who's holding it. */
export const getJournalSeen = createServerFn({ method: "GET" }).handler(() => {
  const me = known(personId());
  return me ? new JournalRepo(getDb()).seen(me) : null;
});

/** This phone's person opened the Journal, when the save was made. */
export const markJournalSeen = createServerFn({ method: "POST" }).handler(() => {
  const me = known(personId());
  if (me) new JournalRepo(getDb()).markSeen(me, madeAt().toISOString());
});

export const journalSeenQuery = queryOptions({ queryKey: ["journalSeen"], queryFn: () => getJournalSeen() });

/** Everything kept in the Journal. */
export type Journal = Awaited<ReturnType<typeof listJournal>>;
export const journalQuery = queryOptions({ queryKey: ["journal"], queryFn: () => listJournal() });

type NoteInput = { id: string; day: string; time: string | null; body: string; kind?: "note" | "letter"; fromBoth?: boolean };
type MovementInput = { id: string; day: string; time: string; body: string; different: boolean };

/** The Journal's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const journalSaves = {
  addNote: save({
    key: "addNote",
    query: journalQuery.queryKey,
    send: (data: NoteInput, made) => addNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, input, made) =>
      journal.some((e) => e.id === input.id)
        ? journal
        : [
            ...journal,
            {
              ...input,
              kind: input.kind ?? "note",
              body: input.body.trim(),
              different: false,
              fromBoth: input.kind === "letter" && (input.fromBoth ?? false),
              by: made.by,
              createdAt: made.at,
              editedBy: null,
              editedAt: null,
            },
          ],
  }),
  editNote: save({
    key: "editNote",
    query: journalQuery.queryKey,
    send: (data: NoteInput, made) => editNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id, day, time, body, kind, fromBoth }, made) =>
      journal.map((e) => {
        if (e.id !== id || e.kind === "movement") return e;
        const both = kind === "note" ? false : kind === "letter" && fromBoth !== undefined ? fromBoth : e.fromBoth;
        return { ...e, day, time, body: body.trim(), kind: kind ?? e.kind, fromBoth: both, editedBy: made.by, editedAt: made.at };
      }),
  }),
  restoreNote: save({
    key: "restoreNote",
    query: journalQuery.queryKey,
    send: (data: JournalEntry, made) =>
      restoreNote({
        data: { ...data, kind: data.kind === "letter" ? "letter" : "note", different: false, fromBoth: data.kind === "letter" && data.fromBoth },
        headers: stamped(made),
      }),
    apply: (journal: Journal, entry) => (journal.some((e) => e.id === entry.id) ? journal : [...journal, entry]),
  }),
  deleteNote: save({
    key: "deleteNote",
    query: journalQuery.queryKey,
    send: (data: { id: string }, made) => deleteNote({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id }) => journal.filter((e) => e.id !== id),
  }),
  addMovement: save({
    key: "addMovement",
    query: journalQuery.queryKey,
    send: (data: MovementInput, made) => addMovement({ data, headers: stamped(made) }),
    apply: (journal: Journal, input, made) =>
      journal.some((e) => e.id === input.id)
        ? journal
        : [
            ...journal,
            { ...input, kind: "movement" as const, body: input.body.trim(), fromBoth: false, by: made.by, createdAt: made.at, editedBy: null, editedAt: null },
          ],
  }),
  editMovement: save({
    key: "editMovement",
    query: journalQuery.queryKey,
    send: (data: MovementInput, made) => editMovement({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id, day, time, body, different }, made) =>
      journal.map((e) => (e.id === id && e.kind === "movement" ? { ...e, day, time, body: body.trim(), different, editedBy: made.by, editedAt: made.at } : e)),
  }),
  restoreMovement: save({
    key: "restoreMovement",
    query: journalQuery.queryKey,
    send: (data: JournalEntry & MovementInput, made) => restoreMovement({ data: { ...data, kind: "movement", fromBoth: false }, headers: stamped(made) }),
    apply: (journal: Journal, entry) => (journal.some((e) => e.id === entry.id) ? journal : [...journal, entry]),
  }),
  deleteMovement: save({
    key: "deleteMovement",
    query: journalQuery.queryKey,
    send: (data: { id: string }, made) => deleteMovement({ data, headers: stamped(made) }),
    apply: (journal: Journal, { id }) => journal.filter((e) => e.id !== id),
  }),
};

/** Opening the Journal, through the outbox like every save: the time it was opened is the save's own. */
export const journalSeenSaves = {
  markJournalSeen: save({
    key: "markJournalSeen",
    query: journalSeenQuery.queryKey,
    send: (_: undefined, made) => markJournalSeen({ headers: stamped(made) }),
    apply: (seen: string | null, _input, made) => (made.by === null ? seen : seen && seen >= made.at ? seen : made.at),
  }),
};

/** When this phone's person last opened the Journal. */
export function useJournalSeen() {
  return useSuspenseQuery(journalSeenQuery);
}

/** journalQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useJournal<TData = Journal>(options?: Omit<UseSuspenseQueryOptions<Journal, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...journalQuery, ...options } as UseSuspenseQueryOptions<Journal, Error, TData, string[]>);
}
