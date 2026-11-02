// It's time (src/lib/itsTime.ts): the starts, their contractions and last
// things, and your own last things. Shared: either phone taps, and while a
// start is under way the query refetches every few seconds so both agree.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ItsTimeRepo } from "../../db/models/itsTime/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { type Contraction, ENDINGS, type Ending, type ItsTime, openStart, type Start, WATERS, type Waters, WORDS_MAX } from "../../lib/itsTime";
import { type Made, save, stamped } from "../../lib/outbox";
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
  .validator(z.object({ startId: id, waters: waters.nullable() }).strict())
  .handler(({ data }) => repo().setWaters(data.startId, data.waters, madeAt()));

export const leaveStart = createServerFn({ method: "POST" })
  .validator(z.object({ startId: id }).strict())
  .handler(({ data }) => repo().leave(data.startId, madeAt()));

export const endStart = createServerFn({ method: "POST" })
  .validator(z.object({ startId: id, ended: z.enum(ENDINGS) }).strict())
  .handler(({ data }) => repo().end(data.startId, data.ended, madeAt()));

export const deleteStart = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().delete(data.id));

export const beginContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id, startId: id }).strict())
  .handler(({ data }) => repo().beginContraction(data.id, data.startId, asker(), madeAt()));

export const endContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id, startId: id, startedAt: z.iso.datetime() }).strict())
  .handler(({ data }) => repo().endContraction(data.id, data.startId, data.startedAt, madeAt()));

export const noteContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id, note: words }).strict())
  .handler(({ data }) => repo().noteContraction(data.id, data.note));

export const deleteContraction = createServerFn({ method: "POST" })
  .validator(z.object({ id }).strict())
  .handler(({ data }) => repo().deleteContraction(data.id));

export const tickStart = createServerFn({ method: "POST" })
  .validator(z.object({ startId: id, key, ticked: z.boolean() }).strict())
  .handler(({ data }) => repo().tick(data.startId, data.key, data.ticked, asker(), madeAt()));

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

/** A start as a save that opens it makes it. */
function newStart(sid: string, made: Made): Start {
  return { id: sid, startedAt: made.at, by: made.by, watersAt: null, waters: null, leftAt: null, endedAt: null, ended: null, contractions: [], ticks: [] };
}

/**
 * The start a save names, changed by `change`, as the server does it
 * (ItsTimeRepo): the one under way stands in for one not here, and with none
 * under way the save opens it. One that has ended is left as it is.
 */
function onStart(data: ItsTime, sid: string, made: Made, change: (s: Start) => Start): ItsTime {
  const named = data.starts.find((s) => s.id === sid);
  if (named) return named.endedAt === null ? { ...data, starts: data.starts.map((s) => (s === named ? change(s) : s)) } : data;
  const open = openStart(data);
  if (open) return { ...data, starts: data.starts.map((s) => (s === open ? change(s) : s)) };
  return { ...data, starts: [change(newStart(sid, made)), ...data.starts] };
}

/** The earlier of two times, either missing. */
const earlier = (a: string | null, b: string) => (a !== null && a < b ? a : b);

/** A contraction changed by `change`, wherever it is. */
function onContraction(data: ItsTime, cid: string, change: (c: Contraction) => Contraction | null): ItsTime {
  return {
    ...data,
    starts: data.starts.map((s) =>
      s.contractions.some((c) => c.id === cid) ? { ...s, contractions: s.contractions.flatMap((c) => (c.id === cid ? (change(c) ?? []) : [c])) } : s
    ),
  };
}

const hasContraction = (data: ItsTime, cid: string) => data.starts.some((s) => s.contractions.some((c) => c.id === cid));

/** In order of starting. */
const byStart = (cs: Contraction[]) => [...cs].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

/**
 * It's time's saves, through the outbox (src/app/model/outbox.ts): each shows
 * at once, and is sent when it can be, keeping the time it was tapped. Each
 * names its start, and a contraction's end carries its beginning, so saves
 * that arrive in another order than they were made still make the same night.
 */
export const itsTimeSaves = {
  beginStart: save({
    key: "beginStart",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string; waters: boolean }, made) => beginStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: sid, waters: w }, made) =>
      onStart(data, sid, made, (s) => ({
        ...s,
        ...(s.id === sid && made.at < s.startedAt ? { startedAt: made.at, by: made.by } : {}),
        watersAt: w ? earlier(s.watersAt, made.at) : s.watersAt,
      })),
  }),
  setWaters: save({
    key: "setWaters",
    query: itsTimeQuery.queryKey,
    send: (data: { startId: string; waters: Waters | null }, made) => setWaters({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { startId, waters: w }, made) =>
      onStart(data, startId, made, (s) => ({ ...s, waters: w ?? s.waters, watersAt: earlier(s.watersAt, made.at) })),
  }),
  leaveStart: save({
    key: "leaveStart",
    query: itsTimeQuery.queryKey,
    send: (data: { startId: string }, made) => leaveStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { startId }, made) => onStart(data, startId, made, (s) => ({ ...s, leftAt: s.leftAt ?? made.at })),
  }),
  endStart: save({
    key: "endStart",
    query: itsTimeQuery.queryKey,
    send: (data: { startId: string; ended: Ending }, made) => endStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { startId, ended }, made) =>
      onStart(data, startId, made, (s) => ({
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
    send: (data: { id: string; startId: string }, made) => beginContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid, startId }, made) =>
      hasContraction(data, cid)
        ? data
        : onStart(data, startId, made, (s) => {
            const later = byStart(s.contractions).find((c) => c.startedAt > made.at);
            return {
              ...s,
              contractions: byStart([
                ...s.contractions.map((c) => (c.endedAt || c.startedAt >= made.at ? c : { ...c, endedAt: made.at })),
                { id: cid, startedAt: made.at, endedAt: later?.startedAt ?? null, note: null, by: made.by },
              ]),
            };
          }),
  }),
  endContraction: save({
    key: "endContraction",
    query: itsTimeQuery.queryKey,
    send: (data: { id: string; startId: string; startedAt: string }, made) => endContraction({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { id: cid, startId, startedAt }, made) => {
      const endedAt = made.at < startedAt ? startedAt : made.at;
      if (hasContraction(data, cid)) return onContraction(data, cid, (c) => (c.endedAt ? c : { ...c, endedAt }));
      return onStart(data, startId, { ...made, at: startedAt }, (s) => ({
        ...s,
        contractions: byStart([...s.contractions, { id: cid, startedAt, endedAt, note: null, by: null }]),
      }));
    },
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
    send: (data: { startId: string; key: string; ticked: boolean }, made) => tickStart({ data, headers: stamped(made) }),
    apply: (data: ItsTime, { startId, key: k, ticked }, made) =>
      onStart(data, startId, made, (s) => ({ ...s, ticks: ticked ? (s.ticks.includes(k) ? s.ticks : [...s.ticks, k]) : s.ticks.filter((t) => t !== k) })),
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
export function useItsTimeQuery<TData = ItsTime>(options?: Omit<UseSuspenseQueryOptions<ItsTime, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...itsTimeQuery, ...options } as UseSuspenseQueryOptions<ItsTime, Error, TData, string[]>);
}
