import { createContext, type ReactNode, use, useCallback, useMemo, useRef, useState } from "react";

/**
 * The desktop's side panel: one place on the right of every page where what
 * you're looking at sits beside what you're working through. One thing at a
 * time: opening another closes the one there (`claim`). What's in it is
 * whoever claimed it, drawn into the slot (`SidePanel`), so it stays its
 * opener's: a row's sheet closes as its row would close it.
 */
type Panel = {
  /** Where `SidePanel` draws, once the layout has drawn the slot. */
  slot: HTMLElement | null;
  setSlot: (node: HTMLElement | null) => void;
  /** Whether anything is in it, so the slot takes its room only then. */
  open: boolean;
  /** Take the panel for `id`, closing whatever had it. */
  claim: (id: string, close: () => void) => void;
  /** Give it up, if `id` still has it. */
  release: (id: string) => void;
};

const PanelContext = createContext<Panel | null>(null);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [holder, setHolder] = useState<string | null>(null);
  const current = useRef<{ id: string; close: () => void } | null>(null);

  const claim = useCallback((id: string, close: () => void) => {
    const was = current.current;
    current.current = { id, close };
    setHolder(id);
    if (was && was.id !== id) was.close();
  }, []);

  const release = useCallback((id: string) => {
    if (current.current?.id !== id) return;
    current.current = null;
    setHolder(null);
  }, []);

  const value = useMemo(() => ({ slot, setSlot, open: holder !== null, claim, release }), [slot, holder, claim, release]);
  return <PanelContext value={value}>{children}</PanelContext>;
}

/** The side panel, inside `PanelProvider` (the desktop's layout). */
export function usePanel(): Panel {
  const panel = use(PanelContext);
  if (!panel) throw new Error("usePanel must be called inside PanelProvider, on a desktop");
  return panel;
}
