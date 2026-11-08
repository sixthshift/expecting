import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { isPrivateItem } from "../../../../content";
import type { Item } from "../../../../content/schema";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";
import { useArrowKeys } from "../../hooks/useArrowKeys";
import { useItems } from "../../hooks/useItems";
import { useSwipe } from "../../hooks/useSwipe";
import { neighbours } from "../../model/through";
import { ItemLink } from "../itemLink/ItemLink";

/**
 * An entry opened from a list (its ids kept in the history entry, by ItemLink):
 * swipe left for the next in it, right for the one before, ← and → on a
 * keyboard, or the links at the foot. Each takes this page's place in the
 * history, so Back is to the list. Only those still in your Library: one an
 * answer hides is passed over.
 */
export function Through({ children }: { children: ReactNode }) {
  const { item } = useLibraryItemPage();
  const items = useItems();
  const list = useRouterState({ select: (s) => s.location.state.list });
  const from = useRouterState({ select: (s) => s.location.state.from });
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { before, after } = item ? neighbours(list, items, item.id) : { before: undefined, after: undefined };
  const go = (to: Item | undefined) =>
    to &&
    list &&
    navigate({
      to: "/library/$itemId",
      params: { itemId: to.id },
      mask: isPrivateItem(to.id) ? { to: "/library" } : undefined,
      state: { list, from },
      replace: true,
    });
  useSwipe(ref, { onLeft: after && (() => go(after)), onRight: before && (() => go(before)) });
  useArrowKeys({ onLeft: before && (() => go(before)), onRight: after && (() => go(after)) });

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {children}
      <ThroughLinks before={before} after={after} list={list} />
    </div>
  );
}

/** The previous and next in the list at an entry's foot, each by its title, each taking its place in the history (`replace`). */
function ThroughLinks({ before, after, list }: { before: Item | undefined; after: Item | undefined; list: readonly string[] | undefined }) {
  if (!before && !after) return null;
  return (
    <nav aria-label="Through the list" className="mt-2 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
      {before ? (
        <ItemLink itemId={before.id} list={list} replace className="flex min-h-11 items-start gap-1 rounded-md text-sm text-fg-subtle hover:text-fg-normal">
          <ChevronLeft aria-hidden size={16} className="mt-0.5 shrink-0" />
          <span className="flex flex-col">
            <span className="text-xs">Previous</span>
            <span className="text-fg-normal">{before.title}</span>
          </span>
        </ItemLink>
      ) : (
        <span />
      )}
      {after ? (
        <ItemLink
          itemId={after.id}
          list={list}
          replace
          className="flex min-h-11 items-start justify-end gap-1 rounded-md text-right text-sm text-fg-subtle hover:text-fg-normal"
        >
          <span className="flex flex-col">
            <span className="text-xs">Next</span>
            <span className="text-fg-normal">{after.title}</span>
          </span>
          <ChevronRight aria-hidden size={16} className="mt-0.5 shrink-0" />
        </ItemLink>
      ) : null}
    </nav>
  );
}
