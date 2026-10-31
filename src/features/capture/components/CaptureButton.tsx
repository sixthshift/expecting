// The capture "+": one way in to add anything, from any pillar. On a phone a
// round button floating bottom-right, just above the tab bar, where a thumb
// reaches, stepping out of the way while the page scrolls down; on a desktop
// "Add" at the top of the sidebar. It opens the sheet.

import { cn } from "@sixthshift/design-system/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useOutOfTheWay } from "../hooks/useOutOfTheWay";
import { CaptureSheet } from "./CaptureSheet";

export function CaptureButton({ layout }: { layout: "float" | "row" }) {
  const [open, setOpen] = useState(false);
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
          "fixed right-4 bottom-[calc(var(--tab-bar)+1rem)] z-30 flex size-14 items-center justify-center rounded-full bg-bg-brand text-fg-on-brand shadow-lg transition-[translate,opacity] duration-(--motion-base) active:scale-95 lg:hidden",
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
