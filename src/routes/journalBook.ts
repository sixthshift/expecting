import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";

/** The pregnancy as a book: the whole recap on one page, to print or save as a PDF. */
export const journalBook = createRoute({
  getParentRoute: () => app,
  path: "/journal/book",
  component: worlds(
    lazyRouteComponent(() => import("../pillars/journal/pages/BookPage"), "BookPage"),
    lazyRouteComponent(() => import("../pillars/journal/quiet/pages/QuietBookPage"), "QuietBookPage")
  ),
});
