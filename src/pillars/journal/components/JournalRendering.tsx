import { useJournalPage } from "../contexts/JournalPageContext";
import { QuietJournal } from "./quiet/QuietJournal";
import { Journal } from "./story/Journal";

/** Which page draws the context: the quiet Journal while something has happened. */
export function JournalRendering() {
  const { quiet } = useJournalPage();
  return quiet ? <QuietJournal /> : <Journal />;
}
