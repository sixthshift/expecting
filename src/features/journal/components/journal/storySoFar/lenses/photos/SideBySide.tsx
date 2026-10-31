import { Modal } from "@sixthshift/design-system/modal";
import { Select } from "@sixthshift/design-system/select";
import { useState } from "react";
import { type BumpWeek, sideBySide } from "../../../../../../../lib/photos";
import { weekLabel } from "../../../../../../../lib/timeline";
import { Picture } from "../../../../entries/photos/Picture";

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
    <Modal size="lg" closable onOpenChange={(open) => (open ? null : onClose())} aria-label="Side by side">
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">Side by side</h2>
      </Modal.Header>
      <Modal.Body className="grid grid-cols-2 gap-3 px-6 pb-6">
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
      </Modal.Body>
    </Modal>
  );
}
