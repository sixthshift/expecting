// What a failed call to the server means for the person holding the phone.

/** The session has ended (logged out on another phone, or the cookie expired): the gate's 401, thrown back by the server function. */
export function isLoggedOut(error: unknown): boolean {
  return error instanceof Response && error.status === 401;
}

/** No answer at all: no connection, or one that goes nowhere (hospital Wi-Fi). fetch's TypeError, whatever the browser words it. */
export function isUnreachable(error: unknown): boolean {
  return error instanceof TypeError;
}

/** Tries at a save the server turns away with an error, before giving up on it: enough to outlast a restart. */
export const SEND_TRIES = 6;

/**
 * Whether a waiting save that failed is sent again (`failures` so far). Unreachable: always, until it
 * gets through. Refused (4xx: the gate, a private entry): never. Anything else (the server's error, or
 * a proxy's while it restarts) a few times, as the server's error may be one that won't go away.
 */
export function sendAgain(failures: number, error: unknown): boolean {
  if (isUnreachable(error)) return true;
  if (error instanceof Response && error.status >= 400 && error.status < 500) return false;
  return failures < SEND_TRIES;
}

/** How long to wait before sending again: doubling from a second, to half a minute. */
export function sendAgainIn(failures: number): number {
  return Math.min(1000 * 2 ** failures, 30_000);
}
