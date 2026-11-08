// A list kept in this phone's localStorage, as JSON: the outbox's saves
// (./outboxStore.ts) and the uploads still waiting (./uploads.ts). Without
// storage (a private window that refuses it) it reads as empty and a write
// is dropped: what it keeps is then kept only in the page.

/** The list kept under `key`, or an empty one. */
export function readList<T>(key: string): T[] {
  try {
    const kept = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(kept) ? kept : [];
  } catch {
    return [];
  }
}

/** Keep `list` under `key`; an empty one takes the key away. */
export function writeList(key: string, list: readonly unknown[]): void {
  try {
    if (list.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // No storage: kept in the page only.
  }
}
