// When a save was made, as the phone that made it says (src/lib/outbox.ts):
// one queued offline and sent hours later keeps the time it was made.

import { getRequestHeader } from "@tanstack/react-start/server";
import { MADE_AT_HEADER, madeAtFrom } from "../../lib/outbox";

/** When this request's save was made: the time it carries, if believable; else now. */
export function madeAt(now: Date = new Date()): Date {
  return madeAtFrom(getRequestHeader(MADE_AT_HEADER), now);
}
