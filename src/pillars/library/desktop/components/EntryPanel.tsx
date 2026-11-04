import { Suspense } from "react";
import { Entry } from "../../components/entry/Entry";
import { ItemSkeleton } from "../../components/entry/ItemSkeleton";
import { HiddenEntry } from "../../components/notInLibrary/HiddenEntry";
import { NoEntry } from "../../components/notInLibrary/NoEntry";
import { LibraryItemPageProvider, useLibraryItemPage } from "../../contexts/LibraryItemPageContext";

/**
 * An entry in the desktop's side panel, beside the page it was opened from
 * (`?panel=item:<id>`, `AddressedPanel`): the same entry its page draws, in
 * the same provider, without what belongs to a page of its own (the way
 * back, going through a list, a private one's quick exit: a private entry
 * never opens here).
 */
export function EntryPanel({ itemId }: { itemId: string }) {
  return (
    <LibraryItemPageProvider itemId={itemId} inPanel>
      <Rendering />
    </LibraryItemPageProvider>
  );
}

function Rendering() {
  const { item, hidden } = useLibraryItemPage();
  if (!item) return hidden ? <HiddenEntry /> : <NoEntry />;
  return (
    <Suspense fallback={<ItemSkeleton title={item.title} />}>
      <Entry />
    </Suspense>
  );
}
