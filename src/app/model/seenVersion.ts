// Which version this phone last saw the notes for, so the app knows when it has
// been updated since. Per phone, in the browser: each of you sees what's new
// once, on your own phone. A phone that has never kept one (a new install, or
// cleared site data) starts at the version it is running, so it isn't shown
// every release that came before it.

/** Where the browser remembers it. */
export const SEEN_VERSION_KEY = "expecting-seen-version";

/** The version this phone last acknowledged, keeping `current` as it when there is none yet. */
export function seenVersion(current: string): string {
  try {
    const seen = localStorage.getItem(SEEN_VERSION_KEY);
    if (seen) return seen;
    localStorage.setItem(SEEN_VERSION_KEY, current);
  } catch {
    // Private browsing: nothing is kept, so there is nothing to show.
  }
  return current;
}

/** This phone has seen the notes up to `version`. */
export function markSeen(version: string): void {
  try {
    localStorage.setItem(SEEN_VERSION_KEY, version);
  } catch {
    // Not kept: the notes show again next time, which is the lesser harm.
  }
}
