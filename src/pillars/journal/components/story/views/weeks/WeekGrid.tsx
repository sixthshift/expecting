// The weeks, a tile a week under its trimester.

import type { WeekTile } from "../../../../../../lib/journal/story/zoom";
import { TRIMESTERS, type Week } from "../../../../../../lib/timeline";
import { Tile } from "./Tile";

/** Weeks, a tile each, newest first, under their trimesters. */
export function WeekGrid({ tiles, now, onOpen }: { tiles: readonly WeekTile[]; now: Week | null; onOpen: (week: Week) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {[...TRIMESTERS].reverse().map((t) => {
        const these = tiles.filter((tile) => tile.week >= t.from && tile.week <= t.to);
        if (these.length === 0) return null;
        return (
          <section key={t.key} aria-label={t.title} className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-fg-strong">{t.title}</h3>
            <ol className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-7">
              {these.map((tile) => (
                <Tile key={tile.week} tile={tile} now={now} onOpen={onOpen} />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
