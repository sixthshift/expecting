// Photos and scans in the Journal: the bump, week by week (the fun part:
// a row of weeks, and two of them side by side), and every photo and scan
// under its week. Shared: both of you see all of them, and either can change
// or delete one. See docs/product/journal.md.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { Camera, Columns2 } from "lucide-react";
import { useState } from "react";
import { usePhotosQuery } from "../../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../../api/rpc/settings";
import type { ISODate } from "../../../../../lib/dates";
import { placeHeading, weekRange } from "../../../../../lib/labels";
import { BUMP_SERIES, type BumpWeek, bumpToTake, bumpWeeks, kindsOffered, type PhotoGroup, type PhotoKind, photoGroups } from "../../../../../lib/photos";
import type { QuietKind } from "../../../../../lib/quiet";
import { type Week, weekLabel } from "../../../../../lib/timeline";
import { describePhoto } from "../../../model/labels";
import { AddPhoto } from "../../entries/photos/AddPhoto";
import { PhotoViewer } from "../../entries/photos/PhotoViewer";
import { Picture } from "../../entries/photos/Picture";
import { Scrubber } from "../../entries/photos/Scrubber";
import { SideBySide } from "./SideBySide";

/** How many weeks are shown before "Show every week". */
const WEEKS_SHOWN = 6;

/** A week's days, and whether it's this one: "This week · 27 Oct – 2 Nov". */
function aside(group: PhotoGroup, dueDate: ISODate | null, now: Week | null): string | null {
  if (typeof group.place !== "number") return null;
  const range = weekRange(group.place, dueDate);
  return [group.place === now ? "This week" : null, range].filter(Boolean).join(" · ") || null;
}

/**
 * The bump, a week each, first week first, ending in this week's empty frame
 * until it's taken. Before the first, the frame alone, with why. Two weeks
 * or more, and they can go side by side.
 */
function BumpRow({
  weeks,
  toTake,
  onOpen,
  onTake,
  onCompare,
}: {
  weeks: BumpWeek[];
  toTake: Week | null;
  onOpen: (b: BumpWeek) => void;
  onTake: () => void;
  onCompare: () => void;
}) {
  return (
    <section aria-labelledby="bump-weeks" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 id="bump-weeks" className="text-sm font-semibold text-fg-strong">
          Your bump, week by week
        </h3>
        {weeks.length >= 2 ? (
          <Button variant="ghost" size="sm" onClick={onCompare}>
            <Columns2 aria-hidden size={16} /> Side by side
          </Button>
        ) : null}
      </div>
      <ol className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {weeks.map((b) => (
          <li key={b.week} className="shrink-0">
            <button
              type="button"
              onClick={() => onOpen(b)}
              className="flex flex-col items-center gap-1 rounded-lg focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <Picture
                fileId={b.photo.fileId}
                variant="thumb"
                alt={`Your bump at ${weekLabel(b.week).toLowerCase()}`}
                className="size-24 rounded-lg object-cover"
              />
              <span className="text-xs text-fg-normal">{weekLabel(b.week)}</span>
            </button>
          </li>
        ))}
        {toTake !== null ? (
          <li className="shrink-0">
            <button
              type="button"
              onClick={onTake}
              className="flex flex-col items-center gap-1 rounded-lg focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label={`Take ${weekLabel(toTake).toLowerCase()}'s bump photo`}
            >
              <span className="flex size-24 items-center justify-center rounded-lg border-2 border-dashed border-border-normal text-fg-brand">
                <Camera aria-hidden size={24} />
              </span>
              <span className="text-xs text-fg-subtle">{weekLabel(toTake)}</span>
            </button>
          </li>
        ) : null}
      </ol>
    </section>
  );
}

/**
 * The story as its photos: the bump week by week (once there's a series:
 * the row, the scrubber, side by side), and every one under its week. New
 * ones come in through the "+". While something has happened it's only
 * drawn inside the Journal's fold, and then plain: the album by week, no
 * bump row, no empty frame, no scrubber, no side by side, and one way to add
 * a photo (never a bump after a loss). Never deleted.
 */
export function PhotosCollection({ quiet }: { quiet: QuietKind | null }) {
  const { data: photos } = usePhotosQuery();
  const { data: settings } = useSettingsQuery();
  const now = useNow();
  const [all, setAll] = useState(false);
  const [viewing, setViewing] = useState<{ ids: string[]; index: number } | null>(null);
  const [adding, setAdding] = useState<{ kind?: PhotoKind } | null>(null);
  const [comparing, setComparing] = useState(false);
  const { dueDate } = settings;
  const kinds = kindsOffered(quiet);

  const groups = photoGroups(photos, dueDate);
  const shown = all ? groups : groups.slice(0, WEEKS_SHOWN);
  const order = groups.flatMap((g) => g.photos.map((p) => p.id));
  const bumps = bumpWeeks(photos, dueDate);
  const open = (id: string) => setViewing({ ids: order, index: Math.max(0, order.indexOf(id)) });

  return (
    <section aria-labelledby="photos" className="flex flex-col gap-4">
      <h2 id="photos" className="text-lg font-display font-semibold text-fg-strong">
        Photos and scans
      </h2>
      {quiet ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAdding({})}>
          Add a photo
        </Button>
      ) : (
        <>
          <p className="text-sm text-fg-subtle">
            The bump and the scans, kept at full size on your own server. Either of you can add one, and you both see them all.
          </p>
          {dueDate && bumps.length > 0 ? (
            <BumpRow
              weeks={bumps}
              toTake={bumpToTake(photos, { now, dueDate, quiet: false })}
              onOpen={(b) => open(b.photo.id)}
              onTake={() => setAdding({ kind: "bump" })}
              onCompare={() => setComparing(true)}
            />
          ) : null}
          {bumps.length >= BUMP_SERIES ? <Scrubber weeks={bumps} /> : null}
        </>
      )}
      {shown.map((group) => (
        <section key={group.key} aria-label={placeHeading(group.place, group.month)} className="flex flex-col gap-2">
          <h3 className="flex items-baseline gap-2 text-sm font-semibold text-fg-strong">
            {placeHeading(group.place, group.month)}
            <span className="font-normal text-fg-subtle">{aside(group, dueDate, now)}</span>
          </h3>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {group.photos.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => open(photo.id)}
                  className="relative block w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <Picture fileId={photo.fileId} variant="thumb" alt={describePhoto(photo, dueDate)} className="aspect-square w-full object-cover" />
                  {photo.kind === "scan" ? (
                    <span aria-hidden className="absolute bottom-1 left-1 rounded-full bg-bg-normal px-2 text-xs text-fg-normal">
                      Scan
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show every week
        </Button>
      ) : null}

      {viewing ? <PhotoViewer ids={viewing.ids} index={viewing.index} kinds={kinds} onClose={() => setViewing(null)} /> : null}
      {comparing ? <SideBySide weeks={bumps} onClose={() => setComparing(false)} /> : null}
      {adding ? (
        <Modal
          size="sm"
          align="top"
          closable
          onOpenChange={(o) => (o ? null : setAdding(null))}
          aria-label={adding.kind === "bump" ? "This week's bump photo" : "Add a photo"}
        >
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">{adding.kind === "bump" ? "This week's bump photo" : "Add a photo"}</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <AddPhoto kind={adding.kind} kinds={kinds} onAdded={() => setAdding(null)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </section>
  );
}
