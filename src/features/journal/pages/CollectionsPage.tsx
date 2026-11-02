import { Collections } from "../components/collections/Collections";
import { JournalFrame } from "../components/JournalFrame";
import { JournalPageProvider } from "../contexts/JournalPageContext";

/**
 * The Journal's collections: everything kept, grouped by what it is, each
 * with its answer at the top (the midwife's "since when?", the paper asked
 * for at triage, the bump so far) and opened in full (`CollectionPage`).
 * The story is everything by time (`JournalFrame`'s other way in). See
 * docs/product/journal.md, The collections.
 */
export function CollectionsPage() {
  return (
    <JournalPageProvider>
      <JournalFrame current="collections">
        <Collections />
      </JournalFrame>
    </JournalPageProvider>
  );
}
