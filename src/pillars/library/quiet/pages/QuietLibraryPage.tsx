import { LibraryPageBody } from "../../components/LibraryPageBody";
import { QuietLibraryHome } from "../components/QuietLibraryHome";

/**
 * The Library while something has happened, the route's quiet world
 * (`worlds`): the search, a door and a shelf as in the other world
 * (`LibraryPageBody`), around the quiet home: the quiet door first, and nothing
 * open right now.
 */
export function QuietLibraryPage() {
  return <LibraryPageBody home={<QuietLibraryHome />} />;
}
