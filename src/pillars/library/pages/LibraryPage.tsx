import { LibraryHome } from "../components/home/LibraryHome";
import { LibraryPageBody } from "../components/LibraryPageBody";

/**
 * Everything Expecting knows, by the question you came with (src/lib/library/doors.ts).
 * Its home lists none of the entries: search first, then the doors, what's open
 * right now, the topics, and the quiet door for when it's hard. A door or a
 * topic opens in place (`?door=can-i`, `?topic=food`), narrowed by chips. Each
 * item also turns up on its week; here it can be found without knowing when.
 * While something has happened, the route draws `QuietLibraryPage` instead
 * (`worlds`): the same search, doors and shelves, around the quiet home.
 */
export function LibraryPage() {
  return <LibraryPageBody home={<LibraryHome />} />;
}
