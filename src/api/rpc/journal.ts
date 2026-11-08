// The Journal: what happens, kept. Shared, and either of you can change
// anything in it; each entry says who wrote it and who changed it last.
// Notes (or letters to the baby), and movements: a movement's words are
// optional, and it may be marked as slower, weaker or stopped.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { JournalRepo } from "../../db/models/journal/repo";
import { isISODate, TIME } from "../../lib/dates";
import type { JournalEntry } from "../../lib/journal/journal";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { known, personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const note = z
  .object({
    id: z.uuid(),
    day: z.string().refine(isISODate, "Not a date"),
    time: z.string().regex(TIME).nullable(),
    body: z.string().trim().min(1).max(10_000),
    /** A letter to the baby, perhaps from both of you. */
    kind: z.enum(["note", "letter"]),
    fromBoth: z.boolean(),
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

const listJournal = createServerFn({ method: "GET" }).handler(() => new JournalRepo(getDb()).list());

const addNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).add(data, personId(), madeAt()));

const editNote = createServerFn({ method: "POST" })
  .validator(note)
  .handler(({ data }) => new JournalRepo(getDb()).edit(data, personId(), madeAt()));

const restoreNote = createServerFn({ method: "POST" })
  .validator(note.extend({ different: z.literal(false), ...kept }).strict())
  .handler(({ data }) =>
    new JournalRepo(getDb()).restore({ ...data, fromBoth: data.kind === "letter" && data.fromBoth, by: known(data.by), editedBy: known(data.editedBy) })
  );

const deleteNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).delete(data.id));

const addMovement = createServerFn({ method: "POST" })
  .validator(movement)
  .handler(({ data }) => new JournalRepo(getDb()).addMovement(data, personId(), madeAt()));

const editMovement = createServerFn({ method: "POST" })
  .validator(movement)
  .handler(({ data }) => new JournalRepo(getDb()).editMovement(data, personId(), madeAt()));

const restoreMovement = createServerFn({ method: "POST" })
  .validator(movement.extend({ kind: z.literal("movement"), fromBoth: z.literal(false).default(false), ...kept }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).restore({ ...data, by: known(data.by), editedBy: known(data.editedBy) }));

const deleteMovement = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new JournalRepo(getDb()).delete(data.id));

/** Everything kept in the Journal. */
export type Journal = Awaited<ReturnType<typeof listJournal>>;
export const journalQuery = queryOptions({ queryKey: ["journal"], queryFn: () => listJournal() });

type NoteInput = { id: string; day: string; time: string | null; body: string; kind: "note" | "letter"; fromBoth: boolean };
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
              body: input.body.trim(),
              different: false,
              fromBoth: input.kind === "letter" && input.fromBoth,
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
      journal.map((e) =>
        e.id !== id || e.kind === "movement"
          ? e
          : { ...e, day, time, body: body.trim(), kind, fromBoth: kind === "letter" && fromBoth, editedBy: made.by, editedAt: made.at }
      ),
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

export const useJournalQuery = queryHook(journalQuery);
