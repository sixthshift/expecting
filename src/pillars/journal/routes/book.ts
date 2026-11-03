import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../../../app/features/quiet/worlds";
import { journal } from "./journal";

/** The pregnancy as a book: the whole recap on one page, to print or save as a PDF. */
export const book = createRoute({
  getParentRoute: () => journal,
  path: "book",
  component: worlds(
    lazyRouteComponent(() => import("../pages/BookPage"), "BookPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietBookPage"), "QuietBookPage")
  ),
});
