import { cn } from "@sixthshift/design-system/utils";
import { Fragment, type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import { slotLabel, slotShortLabel } from "../../../lib/timeline";
import type { Mark } from "../../../lib/timelineView";

type Props = {
  marks: Mark[];
  /** The week in view, as an index into `marks`. */
  active: number;
  /** Move to a week. `settle` is true once a drag ends, or for a click or a key. */
  onSeek: (index: number, settle: boolean) => void;
  orientation: "vertical" | "horizontal";
  className?: string;
};

/**
 * Weeks worth a number on the ruler: preconception, every fourth week, and the
 * first week after the birth. Week 1 sits right against preconception, so it is
 * left to its tick. On the scrubber the current week says "Now" instead.
 */
function labelled(m: Mark): boolean {
  if (m.slot.phase === "preconception") return true;
  return m.slot.week % 4 === 0 || (m.slot.phase === "postpartum" && m.slot.week === 1);
}

/**
 * The whole timeline at a glance, and the way to move along it. A slider:
 * drag or tap to scrub, arrows step a week, Page Up/Down a month, Home/End the
 * ends. Each week shows a dot when something starts and turns amber when a task
 * there has slipped; "now" is marked, and so is the week in view.
 *
 * Vertical, it is the desktop's rail, down the right edge. Horizontal, it is the phone's
 * scrubber along the bottom edge, under the thumb.
 */
export function Ruler({ marks, active, onSeek, orientation, className }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const vertical = orientation === "vertical";
  const n = marks.length;
  const shown = dragging ?? active;
  const current = marks[shown];

  function indexAt(event: PointerEvent): number {
    const rect = track.current!.getBoundingClientRect();
    const fraction = vertical ? (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
    return Math.min(n - 1, Math.max(0, Math.floor(fraction * n)));
  }

  function down(event: PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const i = indexAt(event);
    setDragging(i);
    onSeek(i, false);
  }

  function move(event: PointerEvent) {
    if (dragging === null) return;
    const i = indexAt(event);
    if (i !== dragging) {
      setDragging(i);
      onSeek(i, false);
    }
  }

  function up(event: PointerEvent) {
    if (dragging === null) return;
    onSeek(indexAt(event), true);
    setDragging(null);
  }

  function key(event: KeyboardEvent) {
    const step: Record<string, number> = {
      ArrowUp: -1,
      ArrowLeft: -1,
      ArrowDown: 1,
      ArrowRight: 1,
      PageUp: -4,
      PageDown: 4,
      Home: -n,
      End: n,
    };
    const by = step[event.key];
    if (by === undefined) return;
    event.preventDefault();
    onSeek(Math.min(n - 1, Math.max(0, active + by)), true);
  }

  const at = (i: number) => `${((i + 0.5) / n) * 100}%`;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Timeline"
      aria-orientation={orientation}
      aria-valuemin={0}
      aria-valuemax={n - 1}
      aria-valuenow={shown}
      aria-valuetext={current ? slotLabel(current.slot) : undefined}
      onKeyDown={key}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => setDragging(null)}
      className={cn(
        "relative touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-border-brand",
        vertical ? "w-full" : "h-full",
        className
      )}
    >
      <div ref={track} className={cn("absolute", vertical ? "inset-y-0 left-0 right-0" : "inset-x-0 top-0 bottom-0")}>
        {/* The spine. */}
        <div className={cn("absolute bg-border-normal", vertical ? "inset-y-0 left-12 w-px" : "inset-x-0 top-1/2 h-px")} />

        {marks.map((m, i) => {
          const big = labelled(m);
          const pos = vertical ? { top: at(i) } : { left: at(i) };
          return (
            <div key={m.key} className="absolute" style={pos}>
              {/* The tick. */}
              <div
                className={cn(
                  "absolute bg-border-strong",
                  vertical ? (big ? "left-9 h-px w-7 -translate-y-1/2" : "left-11 h-px w-3 -translate-y-1/2") : big ? "top-1.5 h-4 w-px" : "top-3 h-2 w-px"
                )}
                style={vertical ? undefined : { transform: "translateX(-50%)" }}
              />
              {big && !(m.isNow && !vertical) ? (
                <span
                  className={cn(
                    "absolute text-fg-subtle tabular-nums",
                    vertical ? "left-0 w-8 -translate-y-1/2 text-right text-xs" : "-translate-x-1/2 text-[10px]"
                  )}
                  style={vertical ? undefined : { top: "1.5rem" }}
                >
                  {m.slot.phase === "preconception" ? (vertical ? "Before" : "B") : slotShortLabel(m.slot)}
                </span>
              ) : null}
              {/* What is there: amber when something has slipped, else a dot when something starts. */}
              {m.overdue || m.starting > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute rounded-full",
                    m.overdue ? "bg-fg-warning" : "bg-fg-brand",
                    vertical ? "left-[3.75rem] -translate-y-1/2" : "-translate-x-1/2"
                  )}
                  style={{
                    width: `${Math.min(8, 4 + m.starting * 1.5)}px`,
                    height: `${Math.min(8, 4 + m.starting * 1.5)}px`,
                    ...(vertical ? {} : { top: "0.15rem" }),
                  }}
                />
              ) : null}
            </div>
          );
        })}

        {/* Where now is: a pill beside the rail; on the scrubber, a brand tick with "Now" in the label row. */}
        {marks.map((m, i) =>
          !m.isNow ? null : vertical ? (
            <span
              key="now"
              className="absolute left-[4.5rem] z-10 -translate-y-1/2 rounded-full bg-bg-brand-strong px-2 py-0.5 text-xs font-medium text-fg-on-brand-strong"
              style={{ top: at(i) }}
            >
              Now
            </span>
          ) : (
            <Fragment key="now">
              <span aria-hidden className="absolute top-1 z-10 h-5 w-0.5 -translate-x-1/2 rounded-full bg-bg-brand-strong" style={{ left: at(i) }} />
              <span className="absolute z-10 -translate-x-1/2 text-[10px] font-semibold text-fg-brand" style={{ left: at(i), top: "1.5rem" }}>
                Now
              </span>
            </Fragment>
          )
        )}

        {/* The week in view, and while dragging, which week that is. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-20 rounded-full border-2 border-border-brand-strong bg-bg-normal",
            vertical ? "left-12 size-3 -translate-x-1/2 -translate-y-1/2" : "top-1/2 size-3 -translate-x-1/2 -translate-y-1/2",
            dragging === null && "transition-all duration-150"
          )}
          style={vertical ? { top: at(shown) } : { left: at(shown) }}
        />
        {dragging !== null && current ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-30 rounded-md bg-bg-strong px-2 py-1 text-xs font-medium whitespace-nowrap text-fg-on-strong shadow",
              vertical ? "left-16 -translate-y-1/2" : "-translate-x-1/2"
            )}
            style={vertical ? { top: at(shown) } : { left: at(shown), bottom: "calc(100% + 0.5rem)" }}
          >
            {slotLabel(current.slot)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
