import { Link } from "@tanstack/react-router";
import { behind, DOOR_INFO, DOORS } from "../../../../lib/library/doors";
import { useItems } from "../../hooks/useItems";
import { DOOR_ICONS } from "./doorIcons";

/** The doors on the Library's home: every way in by its question, but the quiet one, each with what's behind it. */
const GRID = DOORS.filter((d) => d !== "hard");

/**
 * The ways into the Library by the question you came with: two across on a
 * phone, four on a desktop, each with examples and how many entries it holds.
 */
export function Doors() {
  const items = useItems();
  return (
    <nav aria-label="Ways in" className="grid grid-cols-2 gap-2 sm:gap-3 desktop:grid-cols-4">
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
