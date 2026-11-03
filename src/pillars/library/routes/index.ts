import { item } from "./item";
import { library } from "./library";
import { libraryIndex } from "./libraryIndex";

/** The Library's addresses: its shelves and search, and one item. */
export const libraryRoutes = library.addChildren([libraryIndex, item]);
