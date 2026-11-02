import { NothingHere } from "../../../../components/NothingHere";
import { cluesIn } from "../../../../lib/library/clues";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";
import { LookFor } from "../lookFor/LookFor";

/** No entry by this name: an old or cut-short link. Look for what it meant. */
export function NoEntry() {
  const { itemId } = useLibraryItemPage();
  return (
    <div className="flex flex-col gap-6">
      <NothingHere title="Not in the Library" />
      <LookFor key={itemId} clues={cluesIn(itemId)} />
    </div>
  );
}
