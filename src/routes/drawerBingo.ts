import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { bingoQuery } from "../api/rpc/bingo";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { bingoSearch } from "./search";

/** Pregnancy bingo, a page of its own from the Drawer: your card, or the other's (`?card=theirs`). */
export const drawerBingo = createRoute({
  getParentRoute: () => app,
  path: "/drawer/bingo",
  validateSearch: bingoSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bingoQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/drawer/features/bingo/pages/BingoPage"), "BingoPage"),
    putAway({
      subject: "Bingo",
      back: { to: "/drawer", label: "The Drawer" },
      title: "Pregnancy bingo",
      lead: "Mark a square when it happens. Five in a row, a column or a diagonal is bingo; the centre's free.",
      width: "2xl",
    })
  ),
});
