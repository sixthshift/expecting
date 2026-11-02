import { Link, useParams, useRouterState } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
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
