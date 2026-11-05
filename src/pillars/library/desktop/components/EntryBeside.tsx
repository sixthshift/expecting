import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { Maximize2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EntryInset } from "./EntryInset";

/**
 * An entry opened in the Library on a desktop, beside the list it was opened
 * from (`?entry=<id>`): the list stays on the left, narrower and live, and
 * the entry reads here, scrolling on its own. Another from the list takes its
 * place (in the history too, so Back is to the list); its close and Esc put
 * it away, back to what stands in its place (a door's overview); a search's
 * has none, since a search always has its first open. "Open full page" goes
 * to the entry's own page, the article alone.
 */
export function EntryBeside({ itemId, closable = true }: { itemId: string; closable?: boolean }) {
  const navigate = useNavigate();
  const router = useRouter();
  const list = useRouterState({ select: (s) => s.location.state.list });
  const pane = useRef<HTMLDivElement>(null);
  const close = () => void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, entry: undefined }), replace: true, resetScroll: false });
  // The full page's way back is to the list, without an entry beside it.
  const from = router.buildLocation({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, entry: undefined }) }).href;

  // Each entry starts at its top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolls back up when the entry changes
  useEffect(() => {
    pane.current?.scrollTo({ top: 0 });
  }, [itemId]);

  // Esc puts it away, unless a dialog (a sheet opened from it) has the key.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!closable || event.key !== "Escape" || event.defaultPrevented || document.querySelector("[role=dialog]")) return;
      close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section
      aria-label="The entry"
      className="sticky top-[calc(var(--top-bar)+1.5rem)] flex max-h-[calc(100dvh-var(--top-bar)-3rem)] flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-normal"
    >
      <div className="flex shrink-0 items-center justify-end gap-1 border-b border-border-subtle px-3 py-1.5">
        <Link
          to="/library/$itemId"
          params={{ itemId }}
          state={{ list, from }}
          className="flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
        >
          <Maximize2 aria-hidden size={15} /> Open full page
        </Link>
        {closable ? (
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-md text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
          >
            <X aria-hidden size={18} />
          </button>
        ) : null}
      </div>
      <div ref={pane} className="min-h-0 overflow-y-auto px-6 pt-5 pb-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <EntryInset key={itemId} itemId={itemId} />
        </div>
      </div>
    </section>
  );
}
