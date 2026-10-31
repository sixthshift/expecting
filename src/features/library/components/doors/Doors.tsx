import { Link } from "@tanstack/react-router";
import {
  BookA,
  CalendarCheck,
  ChevronRight,
  CircleHelp,
  HandCoins,
  HeartHandshake,
  HeartPulse,
  type LucideIcon,
  Route,
  Signpost,
  Sparkles,
} from "lucide-react";
import type { Item } from "../../../../content/schema";
import { behind, DOOR_INFO, DOORS, type Door } from "../../../../lib/library";

const DOOR_ICONS: Record<Door, LucideIcon> = {
  "can-i": CircleHelp,
  normal: HeartPulse,
  surprises: Sparkles,
  glossary: BookA,
  moments: CalendarCheck,
  decisions: Signpost,
  money: HandCoins,
  guides: Route,
  hard: HeartHandshake,
};

/** The doors on the Library's home: every way in by its question, but the quiet one, each with what's behind it. */
const GRID = DOORS.filter((d) => d !== "hard");

/**
 * The ways into the Library by the question you came with: two across on a
 * phone, four on a desktop, each with examples and how many entries it holds.
 */
export function Doors({ items }: { items: readonly Item[] }) {
  return (
    <nav aria-label="Ways in" className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {GRID.map((door) => {
        const Icon = DOOR_ICONS[door];
        const { title, examples } = DOOR_INFO[door];
        const count = behind(door, items).length;
        return (
          <Link
            key={door}
            to="/library"
            search={{ door }}
            className="flex h-full flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-3 hover:border-border-brand sm:gap-3 sm:p-4"
          >
            <span className="flex items-center justify-between">
              <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-bg-brand-subtle text-fg-brand">
                <Icon className="size-5" />
              </span>
              <span className="text-xs text-fg-subtle">{count}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="leading-snug font-display font-semibold text-fg-strong sm:text-lg">{title}</span>
              <span className="text-sm text-fg-subtle">{examples}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** The quiet door, for when it's hard: a line at the foot of the page, not a tile among the others. */
export function HardDoor({ items }: { items: readonly Item[] }) {
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
