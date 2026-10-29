// What a failed call to the server means for the person holding the phone.

/** The session has ended (logged out on another phone, or the cookie expired): the gate's 401, thrown back by the server function. */
export function isLoggedOut(error: unknown): boolean {
  return error instanceof Response && error.status === 401;
}
