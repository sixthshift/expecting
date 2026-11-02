import { getRouteApi, Link, Navigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { type Collection, FOLDED_WHILE_QUIET } from "../../../lib/story/collections";
import { JournalTabs } from "../components/JournalTabs";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";
import { AppetiteCollection } from "../features/appetite/components/collection/AppetiteCollection";
import { FeelingsCollection } from "../features/feelings/components/collection/FeelingsCollection";
import { FirstsCollection } from "../features/firsts/components/collection/FirstsCollection";
import { MovementsCollection } from "../features/movements/components/collection/MovementsCollection";
import { NotesCollection } from "../features/notes/components/collection/NotesCollection";
import { PapersCollection } from "../features/papers/components/collection/PapersCollection";
import { PhotosCollection } from "../features/photos/components/collection/PhotosCollection";

const route = getRouteApi("/app/journal/collections/$name");

/** One of the Journal's collections, all of it (`/journal/collections/photos`): what it shows best first (a pattern, the bump), then every one. */
export function CollectionPage() {
  return (
    <JournalPageProvider>
      <PillarLayout title="Journal" className="gap-6">
        <JournalTabs current="collections" />
        <OneCollection />
      </PillarLayout>
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
