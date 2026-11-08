// The outbox's copy on the phone: a save is written here before it is shown
// or sent, and taken out once the server has it or has turned it away, so one
// made offline outlasts closing the app. localStorage, not IndexedDB: it
// writes at once, so a save is kept by the time the tap returns, even if the
// app is swiped away straight after. A handful of small saves fit easily.
// Without it (a private window that refuses it), saves still go, kept only
// while the page is open.

import type { Made } from "../../lib/outbox";
import { readList, writeList } from "./storedList";

/** A save waiting: its own id, its save's key (src/lib/outbox.ts), its input, who made it and when, and its place in the queue. */
export type Entry = { id: string; key: string; input: unknown; made: Made; seq: number };

/** Where the saves are kept. e2e/fixtures.ts reads it too, to wait for them to go. */
const OUTBOX_KEY = "expecting-outbox";

const read = () => readList<Entry>(OUTBOX_KEY);
const write = (entries: Entry[]) => writeList(OUTBOX_KEY, entries);

let last = 0;

/** A place in the queue after every one before it, even two in the same millisecond. */
export function nextSeq(): number {
  last = Math.max(Date.now(), last + 1);
  return last;
}

export function keep(entry: Entry): void {
  write([...read().filter((e) => e.id !== entry.id), entry]);
}

export function forget(id: string): void {
  write(read().filter((e) => e.id !== id));
}

/** Every save waiting, in the order made. */
export function waitingEntries(): Entry[] {
  return read().sort((a, b) => a.seq - b.seq);
}

/** A save the server has: when it landed, by this phone's clock. */
export type Landed = Omit<Entry, "seq"> & { landedAt: number };

/** Where the saves that landed are kept, for an answer the service worker kept from before them (./kept.ts). */
const LANDED_KEY = "expecting-outbox-landed";

/** How many landed saves are kept: plenty for any answer the worker still has from before them. */
const LANDED_MAX = 200;

let landed: Landed[] | undefined;

/** Every save that landed, in the order it did. */
export function landedEntries(): Landed[] {
  landed ??= readList<Landed>(LANDED_KEY);
  return landed;
}

/** A save has landed: kept, the oldest let go past LANDED_MAX. */
export function land(save: Omit<Landed, "landedAt">, landedAt: number = Date.now()): void {
  landed = [...landedEntries().filter((e) => e.id !== save.id), { ...save, landedAt }].slice(-LANDED_MAX);
  writeList(LANDED_KEY, landed);
}
