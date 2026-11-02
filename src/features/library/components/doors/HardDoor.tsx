import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { behind, DOOR_INFO } from "../../../../lib/library/doors";
import { useItems } from "../../hooks/useItems";
import { DOOR_ICONS } from "./doorIcons";

/** The quiet door, for when it's hard: a line at the foot of the page, not a tile among the others. */
export function HardDoor() {
  const items = useItems();
  const { title, examples } = DOOR_INFO.hard;
  const Icon = DOOR_ICONS.hard;
  if (behind("hard", items).length === 0) return null;
  return (
    <Link
      to="/library"
      search={{ door: "hard" }}
      className="flex min-h-14 items-center gap-3 rounded-xl border border-border-subtle bg-bg-subtle px-4 py-3 hover:border-border-normal"
    >
      <Icon aria-hidden size={20} className="shrink-0 text-fg-subtle" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium text-fg-strong">{title}</span>
        <span className="text-sm text-fg-subtle">{examples}</span>
      </span>
      <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
    </Link>
  );
}
