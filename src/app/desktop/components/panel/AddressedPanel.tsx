import { Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { BookOpen, Maximize2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { builtInItems, isPrivateItem } from "../../../../content";
import { panelItem } from "../../../model/panel";
import { SidePanel } from "./SidePanel";

const EntryInset = lazy(() => import("../../../../pillars/library/desktop/components/EntryInset").then((m) => ({ default: m.EntryInset })));

/**
 * What the address puts in the side panel (`?panel=item:<id>`): a Library
 * entry beside the page, opened by any link to one (`ItemLink`). Closing it
 * takes it out of the address, without the page moving. Never a private
 * entry, and not on that entry's own page.
 */
export function AddressedPanel() {
  const panel = useSearch({ strict: false, select: (search: { panel?: string }) => search.panel });
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const itemId = panelItem(panel);
  if (!itemId || isPrivateItem(itemId) || pathname === `/library/${itemId}`) return null;
  const title = builtInItems.find((i) => i.id === itemId)?.title ?? "From the Library";

  function close() {
    void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, panel: undefined }), replace: true, resetScroll: false });
  }

  return (
    <SidePanel
      key={itemId}
      label={title}
      kicker={
        <span className="flex items-center gap-1.5">
          <BookOpen aria-hidden size={15} className="text-fg-brand" /> From the Library
        </span>
      }
      actions={
        <Link
          to="/library/$itemId"
          params={{ itemId }}
          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
        >
          <Maximize2 aria-hidden size={15} /> Open in full
        </Link>
      }
      onClose={close}
    >
      <Suspense fallback={null}>
        <EntryInset itemId={itemId} />
      </Suspense>
    </SidePanel>
  );
}
