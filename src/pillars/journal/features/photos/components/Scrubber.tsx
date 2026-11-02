// The bump, week by week, as something to drag through: the picture changes
// as you go, and plays on its own. Once there's a series (two weeks or more);
// never while something has happened. The flipbook is the recap's too.

import { Button } from "@sixthshift/design-system/button";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { BumpWeek } from "../../../../../lib/photos";
import { weekLabel } from "../../../../../lib/timeline";
import { Picture } from "./Picture";

/** How long each week shows while playing. */
const FRAME_MS = 700;

/** The bump, a frame a week, with a slider through the weeks and Play. */
export function Flipbook({ weeks, size = "md" }: { weeks: readonly BumpWeek[]; size?: "md" | "lg" }) {
  const [index, setIndex] = useState(weeks.length - 1);
  const [playing, setPlaying] = useState(false);
  const at = weeks[Math.min(index, weeks.length - 1)];

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        if (i >= weeks.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, [playing, weeks.length]);

  if (!at) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <Picture
        fileId={at.photo.fileId}
        variant="display"
        alt={`Your bump at ${weekLabel(at.week).toLowerCase()}`}
        className={size === "lg" ? "aspect-[3/4] w-full max-w-sm rounded-lg object-cover" : "aspect-[3/4] w-full max-w-60 rounded-lg object-cover"}
      />
      <p className="text-sm font-medium text-fg-strong" aria-live="polite">
        {weekLabel(at.week)}
      </p>
      {weeks.length < 2 ? null : (
        <div className="flex w-full max-w-sm items-center gap-3 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={playing ? "Pause" : "Play the weeks"}
            onClick={() => {
              if (!playing && index >= weeks.length - 1) setIndex(0);
              setPlaying(!playing);
            }}
          >
            {playing ? <Pause aria-hidden size={18} /> : <Play aria-hidden size={18} />}
          </Button>
          <input
            type="range"
            min={0}
            max={weeks.length - 1}
            value={index}
            onChange={(e) => {
              setPlaying(false);
              setIndex(Number(e.target.value));
            }}
            aria-label="Week"
            aria-valuetext={weekLabel(at.week)}
            className="flex-1 accent-(--fg-brand)"
          />
        </div>
      )}
    </div>
  );
}

/** In the Photos view: the bump through the weeks. */
export function Scrubber({ weeks }: { weeks: readonly BumpWeek[] }) {
  return (
    <section aria-labelledby="scrubber" className="flex flex-col gap-2">
      <h3 id="scrubber" className="text-sm font-semibold text-fg-strong">
        Through the weeks
      </h3>
      <Flipbook weeks={weeks} />
    </section>
  );
}
