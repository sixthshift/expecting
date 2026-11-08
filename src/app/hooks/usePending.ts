import { toast } from "@sixthshift/design-system/overlay";
import { useState } from "react";
import { isLoggedOut } from "../../lib/errors";
import { loggedOut } from "../model/loggedOut";

/** What a failed call says: the session ended goes to log in; anything else, a toast titled `title`. */
export function sayFailed(cause: unknown, title: string): void {
  if (isLoggedOut(cause)) loggedOut();
  else toast({ intent: "danger", title, children: "Check your connection and try again." });
}

/**
 * A call that isn't a save (logging in, making an invite): `run` holds
 * `pending` while it goes, ignores a second tap meanwhile, and says so if it
 * fails. A save is `useAction`, which also refetches what's on screen.
 */
export function usePending(title = "That didn't go through"): [pending: boolean, run: (call: () => Promise<void>) => Promise<void>] {
  const [pending, setPending] = useState(false);
  async function run(call: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    try {
      await call();
    } catch (cause) {
      sayFailed(cause, title);
    } finally {
      setPending(false);
    }
  }
  return [pending, run];
}
