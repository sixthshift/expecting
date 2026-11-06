import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

/** Whether a key press belongs to something being typed in, or to a dialog that's open: then it isn't a shortcut. */
export function typingOrInDialog(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return true;
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return true;
  return document.querySelector("[role='dialog'], [role='alertdialog']") !== null;
}

/** The Library's search box, once the page has drawn it: tried for a second, as the page may still be on its way. */
function focusSearch(tries = 30) {
  const input = document.querySelector<HTMLInputElement>('input[aria-label="Search the library"]');
  if (input) input.focus();
  else if (tries > 0) requestAnimationFrame(() => focusSearch(tries - 1));
}

/** Goes to the Library's search, from anywhere, ready to type in: `/`, and the desktop's search in its top bar. */
export function useSearchLibrary(): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    // Every page in the Library has the search at its top (LibraryFrame).
    if (window.location.pathname === "/library" || window.location.pathname.startsWith("/library/")) focusSearch();
    else void navigate({ to: "/library" }).then(() => focusSearch());
  }, [navigate]);
}

/**
 * The keyboard's ways round, on a desktop (or a tablet with a keyboard):
 * `/` searches the Library, from anywhere. The "+" has its own, `n`
 * (CaptureButton). Never while typing, and never under a dialog.
 */
export function useShortcuts(): void {
  const search = useSearchLibrary();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || typingOrInDialog(event)) return;
      event.preventDefault();
      search();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [search]);
}
