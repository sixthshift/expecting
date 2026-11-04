import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { usePanel } from "./panel";

/**
 * Something open in the desktop's side panel, beside the page: its top (a
 * `title`, or a `kicker` above what draws its own, an entry's card) with
 * `actions` and the close, then what it shows. The page stays live behind
 * nothing: you scroll it, tick on it, open the next thing, which takes the
 * panel's place. Esc closes it, as does the close; Back too, where it was
 * opened by its address (an entry, `?panel=`).
 */
export function SidePanel({
  label,
  title,
  kicker,
  actions,
  onClose,
  children,
}: {
  /** What the panel is called to a screen reader: the thing's name. */
  label: string;
  /** Its heading, when what it shows doesn't draw its own. */
  title?: ReactNode;
  /** A small line in its top, where what it shows draws its own heading ("From the Library"). */
  kicker?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const { slot, claim, release } = usePanel();
  const id = useId();
  const top = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    claim(id, () => close.current());
    return () => release(id);
  }, [id, claim, release]);

  // Its top takes the keyboard's place when it opens, so Tab goes on through what it shows.
  useEffect(() => {
    top.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // A dialog over it closes first.
      if (document.querySelector("[role='dialog'], [role='alertdialog']")) return;
      close.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!slot) return null;
  return createPortal(
    <aside aria-label={label} className="flex min-h-full flex-col">
      <header
        ref={top}
        tabIndex={-1}
        className="sticky top-0 z-10 flex items-center gap-2 border-b border-border-subtle bg-bg-normal/95 px-5 py-3 outline-none backdrop-blur"
      >
        <div className="min-w-0 flex-1">
          {title ? (
            <h2 className="truncate font-display text-lg font-semibold text-fg-strong">{title}</h2>
          ) : (
            <div className="text-sm text-fg-subtle">{kicker}</div>
          )}
        </div>
        {actions}
        <button
          type="button"
          onClick={() => close.current()}
          aria-label="Close"
          title="Close (Esc)"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
        >
          <X aria-hidden size={18} />
        </button>
      </header>
      <div className="flex flex-col gap-4 px-5 pt-4 pb-10">{children}</div>
    </aside>,
    slot
  );
}
