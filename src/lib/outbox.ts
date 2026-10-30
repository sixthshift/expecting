// A save that can wait for a connection: the outbox (src/app/model/outbox.ts)
// keeps it on the phone, shows it at once, and sends it when it can, the app
// closed and opened again in between. Each is defined beside its server
// function, in src/api/rpc/.

/** Who made a save, and when: how it shows before the server has it, and the time it is stamped with when it arrives. */
export type Made = { at: string; by: string | null };

/**
 * A save the outbox can hold: `send` calls its server function, and `apply`
 * is what it does to the one query it changes (`query`, a query key), so it
 * shows at once and stays shown, over whatever is fetched, until it is sent.
 * `apply` must give the same answer run twice: a fetch may already include it.
 */
export type Save<Input, Data> = {
  /** The mutation key, kept with a waiting save: renaming one loses saves waiting under the old name. */
  key: string;
  query: readonly unknown[];
  send: (input: Input, made: Made) => Promise<unknown>;
  apply: (data: Data, input: Input, made: Made) => Data;
};

/** A save, typed: `Input` from `send`'s, `Data` from `apply`'s. */
export function save<Input, Data>(definition: Save<Input, Data>): Save<Input, Data> {
  return definition;
}

/** The header a save carries: when it was made, so one sent hours later keeps its time (src/server/core/madeAt.ts). */
export const MADE_AT_HEADER = "x-expecting-made-at";

/** The headers that stamp a save with when it was made. */
export function stamped(made: Made): Record<string, string> {
  return { [MADE_AT_HEADER]: made.at };
}

/** How long a save can wait and still keep its time: one older is stamped when it arrives. */
export const KEEPS_TIME_MS = 60 * 86_400_000;

/** When a save was made: the time it carries, unless that's missing, in the future (a phone's clock ahead) or too long ago; then `now`. */
export function madeAtFrom(sent: string | undefined, now: Date): Date {
  const at = new Date(sent ?? "");
  const ms = at.getTime();
  return Number.isNaN(ms) || ms > now.getTime() || now.getTime() - ms > KEEPS_TIME_MS ? now : at;
}

/** A new id for something made on this phone, so a save after it (deleting it) can name it before the server has it. */
export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // randomUUID is only on a secure origin (https, localhost): Expecting on a home network's address is neither.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const hex = Array.from(b, (n) => n.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
