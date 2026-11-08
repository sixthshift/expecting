// Sickness and cravings: being sick, a craving, or something gone off. Shared,
// as notes are: either of you keeps one, sees all, and can change any; each
// says who kept it and who changed it last (src/lib/journal/appetite.ts).

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppetiteRepo } from "../../db/models/appetite/repo";
import { isISODate, TIME } from "../../lib/dates";
import { APPETITE_KINDS, type AppetiteEntry, type AppetiteInput, HOWS, isWhole, tidy } from "../../lib/journal/appetite";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { known, personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const fields = {
  id: z.uuid(),
  kind: z.enum(APPETITE_KINDS),
  day: z.string().refine(isISODate, "Not a date"),
  time: z.string().regex(TIME).nullable(),
  how: z.enum(HOWS).nullable(),
  what: z.string().max(200).nullable(),
  note: z.string().max(10_000).nullable(),
};

/** Sickness says how bad; a craving or something gone off says what. */
const whole = (input: AppetiteInput) => isWhole(input);
const WHOLE = "Sickness needs how bad, and a craving what";

const entry = z.object(fields).strict().refine(whole, WHOLE);

const listAppetite = createServerFn({ method: "GET" }).handler(() => new AppetiteRepo(getDb()).list());

const addAppetite = createServerFn({ method: "POST" })
  .validator(entry)
  .handler(({ data }) => new AppetiteRepo(getDb()).add(data, personId(), madeAt()));

const editAppetite = createServerFn({ method: "POST" })
  .validator(entry)
  .handler(({ data }) => new AppetiteRepo(getDb()).edit(data, personId(), madeAt()));

const restoreAppetite = createServerFn({ method: "POST" })
  .validator(
    z
      .object({ ...fields, by: z.uuid().nullable(), createdAt: z.iso.datetime(), editedBy: z.uuid().nullable(), editedAt: z.iso.datetime().nullable() })
      .strict()
      .refine(whole, WHOLE)
  )
  .handler(({ data }) => new AppetiteRepo(getDb()).restore({ ...data, by: known(data.by), editedBy: known(data.editedBy) }));

const deleteAppetite = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new AppetiteRepo(getDb()).delete(data.id));

/** Every sickness, craving and thing gone off, kept by either of you. */
export type Appetite = AppetiteEntry[];
export const appetiteQuery = queryOptions({ queryKey: ["appetite"], queryFn: (): Promise<Appetite> => listAppetite() });

/** Sickness and cravings' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const appetiteSaves = {
  addAppetite: save({
    key: "addAppetite",
    query: appetiteQuery.queryKey,
    send: (data: AppetiteInput, made) => addAppetite({ data, headers: stamped(made) }),
    apply: (entries: Appetite, input, made) =>
      entries.some((e) => e.id === input.id) ? entries : [...entries, { ...tidy(input), by: made.by, createdAt: made.at, editedBy: null, editedAt: null }],
  }),
  editAppetite: save({
    key: "editAppetite",
    query: appetiteQuery.queryKey,
    send: (data: AppetiteInput, made) => editAppetite({ data, headers: stamped(made) }),
    apply: (entries: Appetite, input, made) => entries.map((e) => (e.id === input.id ? { ...e, ...tidy(input), editedBy: made.by, editedAt: made.at } : e)),
  }),
  restoreAppetite: save({
    key: "restoreAppetite",
    query: appetiteQuery.queryKey,
    send: (data: AppetiteEntry, made) => restoreAppetite({ data, headers: stamped(made) }),
    apply: (entries: Appetite, entry) => (entries.some((e) => e.id === entry.id) ? entries : [...entries, entry]),
  }),
  deleteAppetite: save({
    key: "deleteAppetite",
    query: appetiteQuery.queryKey,
    send: (data: { id: string }, made) => deleteAppetite({ data, headers: stamped(made) }),
    apply: (entries: Appetite, { id }) => entries.filter((e) => e.id !== id),
  }),
};

export const useAppetiteQuery = queryHook(appetiteQuery);
