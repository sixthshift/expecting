// Answers the service worker kept: with no connection, or one too slow to
// wait for, a server function is answered from the worker's copy
// (src/pwa/worker.js), stamped with when it was asked for. That copy can be
// from before a save that has since landed, and is no longer waiting to be
// applied over it; the outbox (./outbox.ts) applies those again, by this mark.

import { createMiddleware } from "@tanstack/react-start";
import { KEPT_AT_HEADER } from "../../lib/outbox";

const keptAt = new WeakMap<object, number>();

/** `data` is the worker's copy, asked for at `asked`. */
export function markKept(data: unknown, asked: number): void {
  if (typeof data === "object" && data !== null) keptAt.set(data, asked);
}

/** When the worker's copy that answered with `data` was asked for; undefined for the network's answer. */
export function keptSince(data: unknown): number | undefined {
  return typeof data === "object" && data !== null ? keptAt.get(data) : undefined;
}

/** Every server function's answer, marked if the worker answered it from its copy. */
export const keptFunctionMiddleware = createMiddleware({ type: "function" }).client(async ({ next, fetch: given }) => {
  let asked: number | undefined;
  const result = await next({
    fetch: async (input, init) => {
      const response = await (given ?? fetch)(input, init);
      const at = Number(response.headers.get(KEPT_AT_HEADER));
      if (at > 0) asked = at;
      return response;
    },
  });
  // The answer is on the result at run time, though Start's type leaves it out.
  const data = (result as { result?: unknown }).result;
  if (asked !== undefined) markKept(data, asked);
  return result;
});
