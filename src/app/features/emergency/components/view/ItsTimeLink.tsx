import { Link } from "@tanstack/react-router";
import { ChevronRight, Hourglass } from "lucide-react";
import { useQuietQuery } from "../../../../../api/rpc/quiet";
import { useItsTimeShown } from "../../../itsTime/hooks/useItsTimeShown";

/**
 * The way to It's time, the page for the night it starts: there at any week,
 * so a labour that starts early finds it too. Never while something has happened.
 */
export function ItsTimeLink() {
  const { data: quiet } = useQuietQuery();
  const { shown } = useItsTimeShown();
  if (quiet) return null;
  return (
    <Link
      to="/its-time"
      className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-normal px-4 text-fg-strong hover:bg-bg-subtle-hovered"
    >
      <span className="flex items-center gap-2">
        <Hourglass aria-hidden size={18} className="text-fg-brand" />
        {shown ? "It's time: the page for the night it starts" : "Labour started early? It's time"}
      </span>
      <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
    </Link>
  );
}
