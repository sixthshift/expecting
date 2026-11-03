import { list } from "./list";
import { lists } from "./lists";
import { listsIndex } from "./listsIndex";

/** The lists' addresses: all of them, and one. */
export const listsRoutes = lists.addChildren([listsIndex, list]);
