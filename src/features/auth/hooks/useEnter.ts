import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

/**
 * In, as whoever just logged in, set up or joined: nothing fetched before (as
 * nobody, or as someone else) is kept, then on to `next`.
 */
export function useEnter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return (next: string) => {
    queryClient.removeQueries();
    router.history.push(next);
  };
}
