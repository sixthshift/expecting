// Who is holding this device: whoever its session is logged in as
// (src/server/auth/gate.ts). Read by every server function that keeps who did something.

import { getRequest } from "@tanstack/react-start/server";
import { sessionOf } from "../auth/gate";

/** The person this device is logged in as, by id; undefined without a session. */
export function personId(): string | undefined {
  return sessionOf(getRequest()) ?? undefined;
}
