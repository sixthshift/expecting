// The outbox's copy on the phone, in IndexedDB: a save is written here before
// it is sent, and taken out once the server has it or has turned it away, so
// one made offline outlasts closing the app. Without IndexedDB (a private
// window that refuses it), saves still go, kept only while the page is open.

import type { Made } from "../../lib/outbox";

/** A save waiting: its own id, its save's key (src/lib/outbox.ts), its input, who made it and when, and its place in the queue. */
export type Entry = { id: string; key: string; input: unknown; made: Made; seq: number };

const DB = "expecting-outbox";
const STORE = "saves";

let opening: Promise<IDBDatabase | null> | undefined;

function open(): Promise<IDBDatabase | null> {
  opening ??= new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return opening;
}

/** One request in its own transaction; resolves once it has committed (a write, to disk: "strict"), undefined if it couldn't. */
async function run<T>(mode: IDBTransactionMode, request: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const db = await open();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode, { durability: "strict" });
      const req = request(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => resolve(undefined);
      tx.onabort = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

let last = 0;

/** A place in the queue after every one before it, even two in the same millisecond. */
export function nextSeq(): number {
  last = Math.max(Date.now(), last + 1);
  return last;
}

export async function keep(entry: Entry): Promise<void> {
  await run("readwrite", (store) => store.put(entry));
}

export async function forget(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

/** Every save waiting, in the order made. */
export async function waitingEntries(): Promise<Entry[]> {
  const all = (await run("readonly", (store) => store.getAll() as IDBRequest<Entry[]>)) ?? [];
  return all.sort((a, b) => a.seq - b.seq);
}
