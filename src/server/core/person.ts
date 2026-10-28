// Who is holding this device: a cookie naming a person, set by
// src/api/rpc/people.ts. Read here too, so an answer can say who gave it.

import { getCookie } from "@tanstack/react-start/server";

export const PERSON_COOKIE = "expecting_person";

/** The person this device says it is, by id; undefined if it hasn't said. */
export function personId(): string | undefined {
  return getCookie(PERSON_COOKIE);
}
