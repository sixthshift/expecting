// The outbox's copy on the phone: a save is written here before it is shown
// or sent, and taken out once the server has it or has turned it away, so one
// made offline outlasts closing the app. localStorage, not IndexedDB: it
// writes at once, so a save is kept by the time the tap returns, even if the
// app is swiped away straight after. A handful of small saves fit easily.
// Without it (a private window that refuses it), saves still go, kept only
// while the page is open.

import type { Made } from "../../lib/outbox";

/** A save waiting: its own id, its save's key (src/lib/outbox.ts), its input, who made it and when, and its place in the queue. */
export type Entry = { id: string; key: string; input: unknown; made: Made; seq: number };

/** Where the saves are kept. e2e/fixtures.ts reads it too, to wait for them to go. */
export const OUTBOX_KEY = "expecting-outbox";

function read(): Entry[] {
  try {
    const kept = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]");
    return Array.isArray(kept) ? kept : [];
  } catch {
    return [];
  }
}

function write(entries: Entry[]): void {
  try {
    if (entries.length === 0) localStorage.removeItem(OUTBOX_KEY);
    else localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch {
    // No storage: the save goes on, kept only in the page.
  }
}

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
