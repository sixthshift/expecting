import { cn } from "@sixthshift/design-system/utils";
import { Plus } from "lucide-react";
import { useOutOfTheWay } from "../../../hooks/useOutOfTheWay";

/** The phone's round "+", which slides down behind the tab bar while the page is scrolled down, and back up; not while its sheet is `open`. */
export function CaptureFloat({ open, onClick }: { open: boolean; onClick: () => void }) {
  const away = useOutOfTheWay() && !open;
  return (
    <button
      type="button"
      aria-label="Add"
      aria-haspopup="dialog"
      onClick={onClick}
      // Still in the tab order while away: a keyboard or a screen reader finds it where it always is.
      className={cn(
        "frame-add fixed right-4 bottom-[calc(var(--tab-bar)+1rem)] z-30 flex size-12 items-center justify-center rounded-full bg-bg-brand text-fg-on-brand shadow-lg transition-[translate,opacity] duration-(--motion-base) active:scale-95",
        away
          ? "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0 ease-(--ease-exit) focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
          : "ease-(--ease-enter)"
      )}
    >
      <Plus aria-hidden size={22} />
    </button>
  );
}
