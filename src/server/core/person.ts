// Who is holding this device: whoever its session is logged in as
// (src/server/auth/gate.ts). Read by every server function that keeps who did something.

import { getRequest } from "@tanstack/react-start/server";
import { PeopleRepo } from "../../db/models/people/repo";
import { sessionOf } from "../auth/gate";
import { getDb } from "./db";

/**
 * The person this device is logged in as, by id. Every server function but
 * the session's (src/api/rpc/session.ts) runs behind the gate, so there is
 * one, and a session goes with its person.
 */
export function personId(): string {
  const id = sessionOf(getRequest());
  if (!id) throw new Error("Log in first");
  return id;
}

/** `id` if they're still here; else nobody. For who kept something, as a phone sends it back (an undo). */
export function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}
