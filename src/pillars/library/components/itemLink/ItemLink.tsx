import { Link, useMatch, useParams, useRouterState } from "@tanstack/react-router";
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
 * On a desktop it doesn't leave the page. In the Library (its doors, search
 * and Right now, `/library`) it opens the entry in the reader over the list
 * (`?entry=<id>`, `EntryReader`), where you came to read: going on through the
 * list, it takes the reader's place in the history, as on a phone. Anywhere
 * else it opens it in the side panel, beside the page you're on
 * (`?panel=item:<id>`), which stays where it was: the reading beside what
 * it's for. Neither for a private entry, whose address stays out of the
 * address bar, nor from an entry's own page, where reading on is reading in
 * full.
 */
export function ItemLink({
  itemId,
  list,
  replace,
  className,
  style,
  "aria-label": label,
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
  children: ReactNode;
}) {
  const here = useParams({ strict: false }).itemId;
  const onPrivate = here !== undefined && isPrivateItem(here);
  const href = useRouterState({ select: (s) => s.location.href });
  const kept = useRouterState({ select: (s) => s.location.state.from });
  const desktop = useLayout() === "desktop";
  const inLibrary = useMatch({ from: "/app/library/", shouldThrow: false }) !== undefined;
  if (desktop && here === undefined && !isPrivateItem(itemId) && inLibrary) {
    return (
      <Link
        to="."
        search={(prev: Record<string, unknown>) => ({ ...prev, entry: itemId })}
        state={{ list }}
        replace={replace}
        resetScroll={false}
        className={className}
        style={style}
        aria-label={label}
      >
        {children}
      </Link>
    );
  }
  if (desktop && here === undefined && !isPrivateItem(itemId)) {
    return (
      <Link
        to="."
        search={(prev: Record<string, unknown>) => ({ ...prev, panel: itemPanel(itemId) })}
        resetScroll={false}
        className={className}
        style={style}
        aria-label={label}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/library/$itemId"
      params={{ itemId }}
      mask={isPrivateItem(itemId) ? { to: "/library" } : undefined}
      replace={replace || onPrivate}
      state={{ list, from: replace || onPrivate ? kept : href }}
      className={className}
      style={style}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
