import { getRouteApi } from "@tanstack/react-router";
import { Suspense } from "react";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
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
      <PillarLayout width="full" className="pt-4 desktop:pt-6">
        <div className="max-w-3xl">
          <Rendering />
        </div>
      </PillarLayout>
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
