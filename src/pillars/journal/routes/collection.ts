import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { isCollection } from "../../../lib/journal/story/collections";
import { collections } from "./collections";

/** One of the Journal's collections, all of it: `/journal/collections/photos`; any other name is the collections. */
export const collection = createRoute({
  getParentRoute: () => collections,
  path: "$name",
  beforeLoad: ({ params }) => {
    if (!isCollection(params.name)) throw redirect({ to: "/journal/collections" });
  },
  component: lazyRouteComponent(() => import("../pages/CollectionPage"), "CollectionPage"),
});
