import { Select } from "@sixthshift/design-system/select";
import { useState } from "react";
import { TitledModal } from "../../../../../../components/TitledModal";
import { type BumpWeek, sideBySide } from "../../../../../../lib/journal/photos";
import { weekLabel } from "../../../../../../lib/timeline";
import { Picture } from "../Picture";

/**
 * The bump side by side: two weeks next to each other, the first and the
 * latest to begin with, each with its week to change. Side by side on a
 * phone too: two halves of the screen is the point.
 */
export function SideBySide({ weeks, onClose }: { weeks: BumpWeek[]; onClose: () => void }) {
  const pair = sideBySide(weeks);
  const [then, setThen] = useState(pair?.[0].week ?? null);
  const [now, setNow] = useState(pair?.[1].week ?? null);
  const options = weeks.map((b) => ({ value: String(b.week), label: weekLabel(b.week) }));
  const sides = [
    { label: "Then", week: then, set: setThen },
    { label: "Now", week: now, set: setNow },
  ];

  return (
    <TitledModal title="Side by side" size="lg" onClose={onClose} className="grid grid-cols-2 gap-3">
      {sides.map(({ label, week, set }) => {
        const shown = weeks.find((b) => b.week === week);
        return (
          <figure key={label} className="flex flex-col gap-2">
            {shown ? (
              <Picture
                fileId={shown.photo.fileId}
                variant="display"
                alt={`Your bump at ${weekLabel(shown.week).toLowerCase()}`}
                className="aspect-[3/4] w-full rounded-md bg-bg-subtle object-contain"
              />
            ) : null}
            <figcaption>
              <Select aria-label={label} options={options} value={week === null ? undefined : String(week)} onValueChange={(v) => set(Number(v))} />
            </figcaption>
          </figure>
        );
      })}
    </TitledModal>
  );
}
