import { Link, useParams } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { isPrivateItem } from "../../../content";

/**
 * A link to an entry's page; every link to one is this. A private entry's
 * address never reaches the address bar or the browser's history: it is
 * masked as the Library's (the real one rides in the history entry's state,
 * so Back and a reload still find it). And leaving a private page for another
 * entry replaces it, so a run of private reading is one history entry, which
 * the quick exit then replaces.
 */
export function ItemLink({
  itemId,
  className,
  style,
  "aria-label": label,
  children,
}: {
  itemId: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const here = useParams({ strict: false }).itemId;
  const onPrivate = here !== undefined && isPrivateItem(here);
  return (
    <Link
      to="/library/$itemId"
      params={{ itemId }}
      mask={isPrivateItem(itemId) ? { to: "/library" } : undefined}
      replace={onPrivate}
      className={className}
      style={style}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
