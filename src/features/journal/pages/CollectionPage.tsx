import { getRouteApi, Link, Navigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { type Collection, FOLDED_WHILE_QUIET } from "../../../lib/story/collections";
import { FeelingsCollection } from "../../feelings/components/history/Feelings";
import { AppetiteCollection } from "../components/collections/appetite/AppetiteCollection";
import { FirstsCollection } from "../components/collections/firsts/FirstsCollection";
import { MovementsCollection } from "../components/collections/movements/MovementsCollection";
import { NotesCollection } from "../components/collections/notes/NotesCollection";
import { PapersCollection } from "../components/collections/papers/PapersCollection";
import { PhotosCollection } from "../components/collections/photos/PhotosCollection";
import { JournalFrame } from "../components/JournalFrame";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";

const route = getRouteApi("/app/journal/collections/$name");

/** One of the Journal's collections, all of it (`/journal/collections/photos`): what it shows best first (a pattern, the bump), then every one. */
export function CollectionPage() {
  return (
    <JournalPageProvider>
      <JournalFrame current="collections">
        <OneCollection />
      </JournalFrame>
    </JournalPageProvider>
  );
}

function OneCollection() {
  // The route lets through only a collection's name.
  const name = route.useParams().name as Collection;
  const { quiet } = useJournalPage();
  // Folded away while something has happened, as in the story: not a collection then, even asked for by address.
  if (quiet && FOLDED_WHILE_QUIET.includes(name)) return <Navigate to="/journal/collections" replace />;
  return (
    <div className="flex flex-col gap-4">
      <Link to="/journal/collections" className="flex min-h-10 items-center gap-1 self-start text-sm text-fg-subtle hover:text-fg-normal">
        <ChevronLeft aria-hidden size={16} />
        All collections
      </Link>
      {name === "movements" ? <MovementsCollection /> : null}
      {name === "appetite" ? <AppetiteCollection /> : null}
      {name === "feelings" ? <FeelingsCollection /> : null}
      {name === "papers" ? <PapersCollection quiet={quiet} /> : null}
      {name === "notes" ? <NotesCollection /> : null}
      {name === "photos" ? <PhotosCollection quiet={quiet} /> : null}
      {name === "firsts" ? <FirstsCollection /> : null}
    </div>
  );
}
