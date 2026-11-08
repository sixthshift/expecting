import { forgetData } from "../../pwa/register";

/**
 * The session has ended: load this page again from the server, whose gate
 * sends it to log in and, once logged in, back here.
 */
export function loggedOut(): void {
  window.location.reload();
}

/**
 * Log out, by `end` (here, or everywhere), and from what the service worker
 * keeps for offline; then a full load of the login, not a navigation, so
 * nothing of yours stays in this tab's memory.
 */
export async function logOut(end: () => Promise<unknown>): Promise<void> {
  await end();
  await forgetData();
  window.location.assign("/login");
}
