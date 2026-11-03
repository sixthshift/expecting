import { book } from "./book";
import { collection } from "./collection";
import { collections } from "./collections";
import { collectionsIndex } from "./collectionsIndex";
import { journal } from "./journal";
import { story } from "./story";

/** The Journal's addresses: the story, the collections and one of them, the book. */
export const journalRoutes = journal.addChildren([story, collections.addChildren([collectionsIndex, collection]), book]);
