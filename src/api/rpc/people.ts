// The two of you, and your accounts: who this phone is logged in as, choosing
// your own password, logging out everywhere, an invite for the other to join,
// and a link for the other to choose a new password. Getting in in the first
// place is src/api/rpc/session.ts, the one file open without a session.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { InviteRepo, SessionRepo } from "../../db/models/auth/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { readSessionCookie, SESSION_COOKIE } from "../../server/auth/cookie";
import { loginOn } from "../../server/auth/gate";
import { hashPassword, verifyPassword } from "../../server/auth/password";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";
import { MIN_PASSWORD } from "./session";

/** The two of you, who's holding this phone, and the place left for the other to join, if any. */
const getPeople = createServerFn({ method: "GET" }).handler(() => {
  const people = new PeopleRepo(getDb());
  return { me: people.get(personId()), people: people.list(), openRole: people.openRole() };
});

export type ChangeResult = { ok: true } | { ok: false; error: "wrong" };

/**
 * Your own password. The current one is asked, unless you have none yet, or
 * logins are off: then
 * whoever reaches Expecting is trusted already, and this is the way back in
 * for one of you alone who forgot theirs (turn logins off, choose a new one,
 * turn them on). Your other phones are logged out; this one stays in.
 */
export const choosePassword = createServerFn({ method: "POST" })
  .validator(z.object({ current: z.string().max(1024).optional(), password: z.string().min(MIN_PASSWORD).max(1024) }).strict())
  .handler(async ({ data }): Promise<ChangeResult> => {
    const id = personId();
    const people = new PeopleRepo(getDb());
    const hash = people.password(id)?.hash;
    if (loginOn() && hash && !(data.current && (await verifyPassword(data.current, hash)))) return { ok: false, error: "wrong" };
    people.setPassword(id, await hashPassword(data.password));
    new SessionRepo(getDb()).endAllFor(id, readSessionCookie(getRequest()) ?? undefined);
    return { ok: true };
  });

/** Every phone and computer logged in as you logs out, this one too. */
export const logOutEverywhere = createServerFn({ method: "POST" }).handler(() => {
  new SessionRepo(getDb()).endAllFor(personId());
  deleteCookie(SESSION_COOKIE, { path: "/" });
});

/** An invite for the other to join, while there's a place: a code to send, in a link, alive a week. A new one ends the last. */
export const makeInvite = createServerFn({ method: "POST" }).handler(() => {
  const by = personId();
  const role = new PeopleRepo(getDb()).openRole();
  if (!role) throw new Error("There are two of you already");
  return { ...new InviteRepo(getDb()).create("join", by), role };
});

/** A link for the other of you to choose a new password, alive a day. Using it logs out every phone of theirs. */
export const makeReset = createServerFn({ method: "POST" }).handler(() => {
  if (!loginOn()) throw new Error("Logins are off");
  const by = personId();
  const other = new PeopleRepo(getDb()).list().find((p) => p.id !== by);
  if (!other) throw new Error("There's nobody else");
  return { ...new InviteRepo(getDb()).create("reset", by, other.id), name: other.name };
});

export type People = Awaited<ReturnType<typeof getPeople>>;
export const peopleQuery = queryOptions({ queryKey: ["people"], queryFn: () => getPeople() });

export const usePeopleQuery = queryHook(peopleQuery);
