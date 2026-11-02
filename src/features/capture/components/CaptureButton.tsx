// The capture "+": one way in to add anything, from any pillar. On a phone a
// round button floating bottom-right, just above the tab bar, where a thumb
// reaches, stepping out of the way while the page scrolls down; on a desktop
// "Add" at the top of the sidebar. It opens the sheet.

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { typingOrInDialog } from "../../../app/hooks/useShortcuts";
import { CaptureFloat } from "./CaptureFloat";
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
    <CaptureFloat onClick={() => setOpen(true)} open={open} onClose={() => setOpen(false)} />
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
