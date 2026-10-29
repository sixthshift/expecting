import { toast } from "@sixthshift/design-system/overlay";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isLoggedOut } from "../../lib/errors";
import { loggedOut } from "../app/loggedOut";

/**
 * A change to the household: run `save`, then refetch whatever the app has on
 * screen, so every pillar sees it. The page stays drawn while it refetches.
 * `pending` lasts until the fresh data is in, for a button's spinner, so a
 * navigation straight after (onboarding's next question) draws what was just
 * saved. Resolves true once saved; false if it failed, which it says in a
 * toast (or, if the session has ended, by going to log in).
 */
export function useAction<Args extends unknown[]>(
  save: (...args: Args) => Promise<unknown>
): [run: (...args: Args) => Promise<boolean>, pending: boolean, error: Error | null] {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (args: Args) => save(...args),
    // Awaited before the mutation settles: refetches every query on screen; the rest refetch when next shown.
    onSuccess: () => queryClient.invalidateQueries(),
  });

  async function run(...args: Args) {
    try {
      await mutateAsync(args);
      return true;
    } catch (cause) {
      if (isLoggedOut(cause)) loggedOut();
      else toast({ intent: "danger", title: "That didn't save", children: "Check your connection and try again." });
      return false;
    }
  }

  return [run, isPending, error];
}
