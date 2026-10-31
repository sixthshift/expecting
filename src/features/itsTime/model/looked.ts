// Whether this phone has looked at It's time: This week offers it once, on
// each phone, until it has. Per phone on purpose: each of you should look.
// Browser storage can be missing (a private window): then it's offered as if
// unseen, which is harmless.

const KEY = "expecting-its-time-looked";

export function hasLooked(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function markLooked(): void {
  try {
    localStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // Nowhere to keep it: offered again next time.
  }
}
