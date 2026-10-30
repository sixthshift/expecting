// The capture "+": one way in to add anything, from any pillar. On a phone a
// round button floating bottom-right, just above the tab bar, where a thumb
// reaches; on a desktop "Add" at the top of the sidebar. It opens the sheet.

import { cn } from "@sixthshift/design-system/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CaptureSheet } from "./CaptureSheet";

export function CaptureButton({ layout }: { layout: "float" | "row" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Add"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          layout === "float"
            ? "fixed right-4 bottom-[calc(var(--tab-bar)+1rem)] z-30 flex size-14 items-center justify-center rounded-full bg-bg-brand text-fg-on-brand shadow-lg lg:hidden"
            : "flex min-h-11 w-full items-center gap-3 rounded-md bg-bg-brand px-3 text-sm font-medium text-fg-on-brand hover:bg-bg-brand-hovered"
        )}
      >
        <Plus aria-hidden size={layout === "float" ? 26 : 18} />
        {layout === "row" ? "Add" : null}
      </button>
      {open ? <CaptureSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}
