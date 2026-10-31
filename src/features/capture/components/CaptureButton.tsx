// The capture "+": one way in to add anything, from any pillar. On a phone a
// round button floating bottom-right, just above the tab bar, where a thumb
// reaches, stepping out of the way while the page scrolls down; on a desktop
// "Add" at the top of the sidebar. It opens the sheet.

import { cn } from "@sixthshift/design-system/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutOfTheWay } from "../../../app/hooks/useOutOfTheWay";
import { typingOrInDialog } from "../../../app/hooks/useShortcuts";
import { CaptureSheet } from "./CaptureSheet";

export function CaptureButton({ layout }: { layout: "float" | "row" }) {
  const [open, setOpen] = useState(false);
  // `n` opens it from the keyboard, wherever the "+" is offered: the sidebar's, which is there on every pillar (hidden on a phone).
  useEffect(() => {
    if (layout !== "row") return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "n" || typingOrInDialog(event)) return;
      event.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout]);
  return layout === "float" ? (
    <Float onClick={() => setOpen(true)} open={open} onClose={() => setOpen(false)} />
  ) : (
    <>
      <button
        type="button"
        aria-label="Add"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-3 rounded-md bg-bg-brand px-3 text-sm font-medium text-fg-on-brand hover:bg-bg-brand-hovered"
      >
        <Plus aria-hidden size={18} />
        Add
        <kbd className="ml-auto rounded-sm border border-fg-on-brand/40 px-1.5 font-sans text-xs opacity-80">N</kbd>
      </button>
      {open ? <CaptureSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** The phone's round "+", which slides down behind the tab bar while the page is scrolled down, and back up. */
function Float({ open, onClick, onClose }: { open: boolean; onClick: () => void; onClose: () => void }) {
  const away = useOutOfTheWay() && !open;
  return (
    <>
      <button
        type="button"
        aria-label="Add"
        aria-haspopup="dialog"
        onClick={onClick}
        // Still in the tab order while away: a keyboard or a screen reader finds it where it always is.
        className={cn(
          "frame-add fixed right-4 bottom-[calc(var(--tab-bar)+1rem)] z-30 flex size-14 items-center justify-center rounded-full bg-bg-brand text-fg-on-brand shadow-lg transition-[translate,opacity] duration-(--motion-base) active:scale-95 lg:hidden",
          away
            ? "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0 ease-(--ease-exit) focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
            : "ease-(--ease-enter)"
        )}
      >
        <Plus aria-hidden size={26} />
      </button>
      {open ? <CaptureSheet onClose={onClose} /> : null}
    </>
  );
}
