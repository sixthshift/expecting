import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** The pregnancy as a book: the whole recap on one page, to print or save as a PDF. */
export const journalBook = createRoute({
  getParentRoute: () => app,
  path: "/journal/book",
  component: lazyRouteComponent(() => import("../features/journal/pages/BookPage"), "BookPage"),
});
