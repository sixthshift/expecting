// The capture "+": one way in to add anything, from any pillar. On a phone a
// round button floating bottom-right, just above the tab bar, where a thumb
// reaches, stepping out of the way while the page scrolls down; on a desktop
// "Add" in the top bar, at its right. It opens the sheet.

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { typingOrInDialog } from "../../../hooks/useShortcuts";
import { CaptureFloat } from "./CaptureFloat";
import { CaptureSheet } from "./CaptureSheet";

export function CaptureButton({ layout }: { layout: "float" | "bar" }) {
  const [open, setOpen] = useState(false);
  // `n` opens it from the keyboard, wherever the "+" is offered: the top bar's or the floating one, whichever the layout draws (one at a time).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "n" || typingOrInDialog(event)) return;
      event.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return layout === "float" ? (
    <CaptureFloat onClick={() => setOpen(true)} open={open} onClose={() => setOpen(false)} />
  ) : (
    <>
      <button
        type="button"
        aria-label="Add"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex min-h-9 shrink-0 items-center gap-2 rounded-md bg-bg-brand pr-2 pl-3 text-sm font-medium text-fg-on-brand hover:bg-bg-brand-hovered"
      >
        <Plus aria-hidden size={17} />
        Add
        <kbd className="rounded-sm border border-fg-on-brand/40 px-1.5 font-sans text-xs opacity-80">N</kbd>
      </button>
      {open ? <CaptureSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}
