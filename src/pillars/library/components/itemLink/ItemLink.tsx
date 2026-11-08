import { Link, useMatch, useParams, useRouterState, useSearch } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { useLayout } from "../../../../app/hooks/useLayout";
import { itemPanel } from "../../../../app/model/panel";
import { isPrivateItem } from "../../../../content";

/**
 * A link to an entry's page; every link to one is this. A private entry's
 * address never reaches the address bar or the browser's history: it is
 * masked as the Library's (the real one rides in the history entry's state,
 * so Back and a reload still find it). And leaving a private page for another
 * entry replaces it, so a run of private reading is one history entry, which
 * the quick exit then replaces. Opened from a list, it keeps the list's ids
 * in that state too, so the entry's page can swipe on to the next and back,
 * and where it was opened from, so its way back can be Back. Going on in
 * place (`replace`) keeps where the first was opened from.
 *
 * On a desktop it doesn't leave the page. In the Library (`/library`: a door,
 * search, Right now) it opens the entry beside the list (`?entry=<id>`,
 * `EntryBeside`), where you came to read: browse and read in one place, the
 * next in the last one's place in the history. Anywhere else it opens it in
 * the side panel, beside the page you're on (`?panel=item:<id>`): the
 * reading beside what it's for. Neither for a private entry, whose address
 * stays out of the address bar, nor from an entry's own page, where reading
 * on is reading in full.
 */
export function ItemLink({
  itemId,
  list,
  replace,
  className,
  style,
  "aria-label": label,
  "aria-current": current,
  children,
}: {
  itemId: string;
  /** The ids of the list it's in, in order, to swipe through from its page. */
  list?: readonly string[];
  /** Take this page's place in the history, as going through a list does: Back is still to the list. */
  replace?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  /** The entry shown, in a list beside it. */
  "aria-current"?: "page";
  children: ReactNode;
}) {
  const here = useParams({ strict: false }).itemId;
  const onPrivate = here !== undefined && isPrivateItem(here);
  const href = useRouterState({ select: (s) => s.location.href });
  const kept = useRouterState({ select: (s) => s.location.state.from });
  const desktop = useLayout() === "desktop";
  const inLibrary = useMatch({ from: "/app/library/", shouldThrow: false }) !== undefined;
  const open = useSearch({ strict: false, select: (s: { entry?: string }) => s.entry });
  const look = { className, style, "aria-label": label, "aria-current": current, children };
  if (desktop && inLibrary && !isPrivateItem(itemId)) {
    return (
      <Link
        {...look}
        to="."
        search={(prev: Record<string, unknown>) => ({ ...prev, entry: itemId })}
        state={{ list }}
        // Another beside the list takes the last one's place, so Back is to the list.
        replace={replace || open !== undefined}
        resetScroll={false}
        aria-current={current ?? (open === itemId ? "page" : undefined)}
      />
    );
  }
  if (desktop && here === undefined && !inLibrary && !isPrivateItem(itemId)) {
    return <Link {...look} to="." search={(prev: Record<string, unknown>) => ({ ...prev, panel: itemPanel(itemId) })} resetScroll={false} />;
  }
  return (
    <Link
      {...look}
      to="/library/$itemId"
      params={{ itemId }}
      mask={isPrivateItem(itemId) ? { to: "/library" } : undefined}
      replace={replace || onPrivate}
      state={{ list, from: replace || onPrivate ? kept : href }}
    />
  );
}
