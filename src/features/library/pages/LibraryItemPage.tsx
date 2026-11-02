import { getRouteApi } from "@tanstack/react-router";
import { Suspense } from "react";
import { Entry } from "../components/entry/Entry";
import { ItemSkeleton } from "../components/entry/ItemSkeleton";
import { HiddenEntry } from "../components/notInLibrary/HiddenEntry";
import { NoEntry } from "../components/notInLibrary/NoEntry";
import { Private } from "../components/private/Private";
import { Through } from "../components/through/Through";
import { WayBack } from "../components/wayBack/WayBack";
import { LibraryItemPageProvider, useLibraryItemPage } from "../contexts/LibraryItemPageContext";

const route = getRouteApi("/app/library/$itemId");

/**
 * One item on its own page, with the way to its week in the whole pregnancy.
 * `LibraryItemPageProvider` works out once what the id in the address is: an
 * entry in your Library, one hidden by an answer or an extra, or none.
 */
export function LibraryItemPage() {
  const { itemId } = route.useParams();
  return (
    <LibraryItemPageProvider itemId={itemId}>
      <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
        <div className="max-w-3xl">
          <Rendering />
        </div>
      </main>
    </LibraryItemPageProvider>
  );
}

/** What the id is: the entry (a private one with its quick exit), one hidden, or none. */
function Rendering() {
  const { item, hidden } = useLibraryItemPage();
  return (
    <>
      {item?.private ? <Private /> : null}
      <WayBack />
      {item ? (
        <Through>
          <Suspense fallback={<ItemSkeleton title={item.title} />}>
            <Entry />
          </Suspense>
        </Through>
      ) : hidden ? (
        <HiddenEntry />
      ) : (
        <NoEntry />
      )}
    </>
  );
}
