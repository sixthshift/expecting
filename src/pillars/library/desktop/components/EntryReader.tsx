import { Modal } from "@sixthshift/design-system/modal";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { builtInItems, isPrivateItem } from "../../../../content";
import type { Item } from "../../../../content/schema";
import { ThroughLinks } from "../../components/through/Through";
import { useItems } from "../../hooks/useItems";
import { neighbours } from "../../model/through";
import { EntryInset } from "./EntryInset";

const BUTTON =
  "flex size-9 items-center justify-center rounded-md text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal disabled:pointer-events-none disabled:opacity-35";

/** Whether a key press belongs to what has focus: typing, or a control that moves with the arrows itself. */
function ownsKey(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable], [role=slider], [role=tablist]") !== null;
}

/**
 * The Library's reader on a desktop: an entry opened from its list (a door,
 * search, Right now) over that list, `?entry=<id>`, at a reading width.
 * Previous and next in the list by its buttons, ← and →, or the titles at its
 * foot, each taking its place in the history, so Back closes it, as it does
 * an entry's page on a phone; Esc, its close and a click outside too. "Open
 * full page" goes on to the entry's own page, which goes on through the same
 * list. Never a private entry: its link goes to its page.
 */
export function EntryReader({ itemId }: { itemId: string }) {
  const items = useItems();
  const list = useRouterState({ select: (s) => s.location.state.list });
  const navigate = useNavigate();
  const router = useRouter();
  const body = useRef<HTMLDivElement>(null);
  const { before, after } = neighbours(list, items, itemId, (i) => !isPrivateItem(i.id));
  const title = builtInItems.find((i) => i.id === itemId)?.title ?? "From the Library";
  const shown = list?.filter((id) => !isPrivateItem(id) && items.some((i) => i.id === id)) ?? [];
  const at = shown.indexOf(itemId);

  function go(to: Item | undefined) {
    if (to)
      void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, entry: to.id }), state: { list }, replace: true, resetScroll: false });
  }
  function close() {
    void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, entry: undefined }), replace: true, resetScroll: false });
  }
  // The full page's way back is to the list, without the reader over it.
  const from = router.buildLocation({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, entry: undefined }) }).href;

  // Each entry starts at its top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolls back up when the entry changes
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [itemId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || ownsKey(event.target)) return;
      if (event.key === "ArrowLeft" && before) {
        event.preventDefault();
        go(before);
      } else if (event.key === "ArrowRight" && after) {
        event.preventDefault();
        go(after);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Modal aria-label={title} onOpenChange={(open) => (open ? null : close())} className="sm:h-[90%] sm:w-[min(46rem,94vw)]">
      <div className="flex shrink-0 items-center gap-1 border-b border-border-subtle px-3 py-2">
        <button type="button" onClick={() => go(before)} disabled={!before} aria-label={before ? `Previous: ${before.title}` : "Previous"} className={BUTTON}>
          <ChevronLeft aria-hidden size={18} />
        </button>
        <button type="button" onClick={() => go(after)} disabled={!after} aria-label={after ? `Next: ${after.title}` : "Next"} className={BUTTON}>
          <ChevronRight aria-hidden size={18} />
        </button>
        {at >= 0 && shown.length > 1 ? (
          <span className="ml-1 text-sm text-fg-subtle tabular-nums">
            {at + 1} of {shown.length}
          </span>
        ) : null}
        <span className="flex-1" />
        <Link
          to="/library/$itemId"
          params={{ itemId }}
          state={{ list, from }}
          replace
          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
        >
          <Maximize2 aria-hidden size={15} /> Open full page
        </Link>
        <button type="button" onClick={close} aria-label="Close" className={BUTTON}>
          <X aria-hidden size={18} />
        </button>
      </div>
      <Modal.Body ref={body} className="px-6 pt-5 pb-8 desktop:px-8">
        <div className="flex flex-col gap-4">
          <EntryInset key={itemId} itemId={itemId} />
          <ThroughLinks before={before} after={after} list={list} />
        </div>
      </Modal.Body>
    </Modal>
  );
}
