import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

/**
 * A change to the household: run `save`, then reload what the app shows, so
 * every pillar sees it. `pending` is true while it runs, for a button's
 * spinner. A failed save throws to the caller, with `pending` put back.
 */
export function useAction<Args extends unknown[]>(save: (...args: Args) => Promise<unknown>): [run: (...args: Args) => Promise<void>, pending: boolean] {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run(...args: Args) {
    setPending(true);
    try {
      await save(...args);
      await router.invalidate();
    } finally {
      setPending(false);
    }
  }

  return [run, pending];
}
