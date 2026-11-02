import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";
import { QuickExit } from "./QuickExit";

/**
 * A private entry's page: the quick exit, and its address kept out of the
 * address bar. Every link to one already masks it (ItemLink); one typed in or
 * opened from outside the app is masked here, in its place.
 */
export function Private() {
  const { itemId } = useLibraryItemPage();
  const navigate = useNavigate();
  // Shown by its own address: not while leaving, when the location is already the next page's and this one is still drawn.
  const bare = useRouterState({ select: (s) => s.location.pathname === `/library/${itemId}` && s.location.maskedLocation === undefined });
  useEffect(() => {
    // A state of its own, or the router would take it for the same place and change nothing.
    if (bare) navigate({ to: "/library/$itemId", params: { itemId }, mask: { to: "/library" }, state: (s) => ({ ...s, masked: true }), replace: true });
  }, [bare, itemId, navigate]);
  return <QuickExit />;
}
