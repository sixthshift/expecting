// It's time (src/lib/itsTime.ts): the starts, their contractions and last
// things, and your own last things. Shared: either phone taps, and while a
// start is under way the query refetches every few seconds so both agree.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ItsTimeRepo } from "../../db/models/itsTime/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { ENDINGS, type Ending, type ItsTime, openStart, type Start, WATERS, type Waters, WORDS_MAX } from "../../lib/itsTime";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** The person this phone says it is, if still here; else nobody. */
function asker(): string | null {
  const id = personId();
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const repo = () => new ItsTimeRepo(getDb());
const id = z.string().uuid();
const waters = z.enum(WATERS);
const words = z.string().max(WORDS_MAX);
/** A tick's key: a bag line's id (a slug), one of the page's own, or an own line's UUID. */
const key = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/);

export const getItsTime = createServerFn({ method: "GET" }).handler(() => repo().get());

export const beginStart = createServerFn({ method: "POST" })
  .validator(z.object({ id, waters: z.boolean() }).strict())
  .handler(({ data }) => repo().begin(data.id, data.waters, asker(), madeAt()));

export const setWaters = createServerFn({ method: "POST" })
  .validator(z.object({ waters: waters.nullable() }).strict())
  .handler(({ data }) => repo().setWaters(data.waters, madeAt()));

export const leaveStart = createServerFn({ method: "POST" }).handler(() => repo().leave(madeAt()));

export const endStart = createServerFn({ method: "POST" })
  .validator(z.object({ ended: z.enum(ENDINGS) }).strict())
  .handler(({ data }) => repo().end(data.ended, madeAt()));

export const deleteStart = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().delete(data.id));

export const beginContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().beginContraction(data.id, asker(), madeAt()));

export const endContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().endContraction(data.id, madeAt()));

export const noteContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id, note: words }).strict())
  .handler(({ data }) => repo().noteContraction(data.id, data.note));

export const deleteContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().deleteContraction(data.id));

export const tickStart = createServerFn({ method: "POST" })
  .validator(z.object({ key, ticked: z.boolean() }).strict())
  .handler(({ data }) => repo().tick(data.key, data.ticked, asker(), madeAt()));

export const addStartLine = createServerFn({ method: "POST" })
  .validator(z.object({ id, title: words.refine((t) => t.trim().length > 0, "Say what it is") }).strict())
  .handler(({ data }) => repo().addLine(data.id, data.title, asker(), madeAt()));

export const deleteStartLine = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().deleteLine(data.id));

/** While a start is under way, how often both phones look again. */
const UNDER_WAY_MS = 4_000;

export const itsTimeQuery = queryOptions({
  queryKey: ["its-time"],
  queryFn: (): Promise<ItsTime> => getItsTime(),
  refetchInterval: (query) => (query.state.data && openStart(query.state.data) ? UNDER_WAY_MS : false),
});

/** The start under way changed by `change`; none under way, nothing changes. */
function onOpen(data: ItsTime, change: (s: Start) => Start): ItsTime {
  const open = openStart(data);
  return open ? { ...data, starts: data.starts.map((s) => (s === open ? change(s) : s)) } : data;
}

/** A contraction changed by `change`, wherever it is. */
function onContraction(data: ItsTime, cid: string, change: (c: Start["contractions"][number]) => Start["contractions"][number] | null): ItsTime {
  return {
    ...data,
    starts: data.starts.map((s) =>
      s.contractions.some((c) => c.id === cid) ? { ...s, contractions: s.contractions.flatMap((c) => (c.id === cid ? (change(c) ?? []) : [c])) } : s
    ),
  };
}

/** It's time's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be, keeping the time it was tapped. */
export const itsTimeSaves = {
  beginStart: save({
    key: "beginStart",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string; waters: boolean }, made) => beginStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: sid, waters: w }, made): ItsTime => {
      if (data.starts.some((s) => s.id === sid)) return data;
      if (openStart(data)) return w ? onOpen(data, (s) => ({ ...s, watersAt: s.watersAt ?? made.at })) : data;
      const start: Start = {
        id: sid,
        startedAt: made.at,
        by: made.by,
        watersAt: w ? made.at : null,
        waters: null,
        leftAt: null,
        endedAt: null,
        ended: null,
        contractions: [],
        ticks: [],
      };
      return { ...data, starts: [start, ...data.starts] };
    },
  }),
  setWaters: save({
    key: "setWaters",
    query: itsTimeQuery.queryKey,
    send: (data: { waters: Waters | null }, made) => setWaters({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { waters: w }, made) => onOpen(data, (s) => ({ ...s, waters: w ?? s.waters, watersAt: s.watersAt ?? made.at })),
  }),
  leaveStart: save({
    key: "leaveStart",
    query: itsTimeQuery.queryKey,
    send: (_: null, made) => leaveStart({ headers: stamped(made) }),
    apply: (data: ItsTime, _, made) => onOpen(data, (s) => ({ ...s, leftAt: s.leftAt ?? made.at })),
  }),
  endStart: save({
    key: "endStart",
    query: itsTimeQuery.queryKey,
    send: (data: { ended: Ending }, made) => endStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { ended }, made) =>
      onOpen(data, (s) => ({
        ...s,
        ended,
        endedAt: made.at,
        contractions: s.contractions.map((c) => (c.endedAt ? c : { ...c, endedAt: made.at })),
      })),
  }),
  deleteStart: save({
    key: "deleteStart",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string }, made) => deleteStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: sid }) => ({ ...data, starts: data.starts.filter((s) => s.id !== sid) }),
  }),
  beginContraction: save({
    key: "beginContraction",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string }, made) => beginContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid }, made) =>
      data.starts.some((s) => s.contractions.some((c) => c.id === cid))
        ? data
        : onOpen(data, (s) => ({
            ...s,
            contractions: [
              ...s.contractions.map((c) => (c.endedAt ? c : { ...c, endedAt: made.at })),
              { id: cid, startedAt: made.at, endedAt: null, note: null, by: made.by },
            ],
          })),
  }),
  endContraction: save({
    key: "endContraction",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string }, made) => endContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid }, made) => onContraction(data, cid, (c) => (c.endedAt ? c : { ...c, endedAt: made.at })),
  }),
  noteContraction: save({
    key: "noteContraction",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string; note: string }, made) => noteContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid, note }) => onContraction(data, cid, (c) => ({ ...c, note: note.trim() || null })),
  }),
  deleteContraction: save({
    key: "deleteContraction",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string }, made) => deleteContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid }) => onContraction(data, cid, () => null),
  }),
  tickStart: save({
    key: "tickStart",
    query: itsTimeQuery.queryKey,
    send: (data: { key: string; ticked: boolean }, made) => tickStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { key: k, ticked }) =>
      onOpen(data, (s) => ({ ...s, ticks: ticked ? (s.ticks.includes(k) ? s.ticks : [...s.ticks, k]) : s.ticks.filter((t) => t !== k) })),
  }),
  addStartLine: save({
    key: "addStartLine",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string; title: string }, made) => addStartLine({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: lid, title }, made) =>
      data.lines.some((l) => l.id === lid) ? data : { ...data, lines: [...data.lines, { id: lid, title: title.trim(), by: made.by, createdAt: made.at }] },
  }),
  deleteStartLine: save({
    key: "deleteStartLine",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string }, made) => deleteStartLine({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: lid }) => ({
      lines: data.lines.filter((l) => l.id !== lid),
      starts: data.starts.map((s) => (s.ticks.includes(lid) ? { ...s, ticks: s.ticks.filter((t) => t !== lid) } : s)),
    }),
  }),
};

/** itsTimeQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. */
export function useItsTime<TData = ItsTime>(options?: Omit<UseSuspenseQueryOptions<ItsTime, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...itsTimeQuery, ...options } as UseSuspenseQueryOptions<ItsTime, Error, TData, string[]>);
}
