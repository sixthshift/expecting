import { SearchInput } from "@sixthshift/design-system/search-input";
import { Outlet } from "@tanstack/react-router";
import { Railed } from "../../../../app/components/layout/PillarLayout";
import { useLayout } from "../../../../app/hooks/useLayout";
import { MobileCorner } from "../../../../app/mobile/components/MobileCorner";
import { LibrarySearchProvider, useLibrarySearch } from "../../contexts/LibrarySearchContext";
import { LibraryRail } from "../../desktop/components/LibraryRail";

/**
 * Every page in the Library under one search, at the top, that stays as you
 * go between them (its home, a door, the results, an entry): one box, never
 * drawn again, so a letter typed on an entry's page carries on in the results
 * with its focus. On a desktop it heads the page's column, beside the rail
 * (drawn here, once, for every page in it), staying as the page scrolls; on a
 * phone it is the Library's top bar, the corner beside it. What sticks on a
 * page sticks under it (`--top-bar`). The pages draw no rail of their own.
 */
export function LibraryFrame() {
  const desktop = useLayout() === "desktop";
  return (
    <LibrarySearchProvider>
      {desktop ? (
        <Railed rail={<LibraryRail />}>
          <div className="sticky top-(--top-bar) z-20 bg-(--expecting-page) print:hidden">
            <div className="mx-auto flex h-20 w-full max-w-[110rem] items-end px-8 pb-2">
              <Box />
            </div>
          </div>
          <div className="[--top-bar:calc(3.5rem+5rem)] print:[--top-bar:0px]">
            <Outlet />
          </div>
        </Railed>
      ) : (
        <>
          <header className="sticky top-0 z-20 flex min-h-14 items-center gap-2 border-b border-border-subtle bg-bg-normal/95 pt-[env(safe-area-inset-top)] pr-2 pl-4 backdrop-blur print:hidden">
            <Box />
            <MobileCorner />
          </header>
          <div className="[--top-bar:calc(3.5rem+env(safe-area-inset-top))] print:[--top-bar:0px]">
            <Outlet />
          </div>
        </>
      )}
    </LibrarySearchProvider>
  );
}

function Box() {
  const { q, onSearch } = useLibrarySearch();
  const desktop = useLayout() === "desktop";
  return (
    <SearchInput
      value={q}
      onValueChange={onSearch}
      placeholder={desktop ? "Search the Library: can I eat brie? Is spotting normal?" : "Search the Library"}
      aria-label="Search the library"
      className={desktop ? "h-12 w-full max-w-3xl text-base" : "h-10 min-w-0 flex-1 text-base"}
    />
  );
}
