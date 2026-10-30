// A private entry (`private: true`: family violence, reproductive coercion)
// leaves no trace in the space both phones share. The app never offers to save
// anything from one; this is the server's half, so nothing it is sent can.
// Every server function passes it, in function middleware (src/start.ts), with
// its input as sent, before the function's own validator: one added later is
// covered without having to remember.

import { builtInItems } from "../../content";
import type { Item } from "../../content/schema";
import { namesPrivate } from "../../lib/library";

/** Every string in `data`, however deep: values and keys. */
function* strings(data: unknown): Generator<string> {
  if (typeof data === "string") yield data;
  else if (Array.isArray(data)) for (const value of data) yield* strings(value);
  else if (data !== null && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      yield key;
      yield* strings(value);
    }
  }
}

/** Null to let a server function's input through; a 400 when any string in it names a private entry. */
export function refusePrivate(data: unknown, items: readonly Item[] = builtInItems): Response | null {
  for (const text of strings(data)) {
    if (namesPrivate(text, items)) return Response.json({ error: "That stays private, so it isn't saved" }, { status: 400 });
  }
  return null;
}
