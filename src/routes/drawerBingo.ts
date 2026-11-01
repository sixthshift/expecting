import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { bingoQuery } from "../api/rpc/bingo";
import { app } from "./app";
import { bingoSearch } from "./search";

/** Pregnancy bingo, a page of its own from the Drawer: your card, or the other's (`?card=theirs`). */
export const drawerBingo = createRoute({
  getParentRoute: () => app,
  path: "/drawer/bingo",
  validateSearch: bingoSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bingoQuery),
  component: lazyRouteComponent(() => import("../features/bingo/pages/BingoPage"), "BingoPage"),
});
