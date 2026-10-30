/**
 * The session has ended: load this page again from the server, whose gate
 * sends it to log in and, once logged in, back here.
 */
export function loggedOut(): void {
  window.location.reload();
}
