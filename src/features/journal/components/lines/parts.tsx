// What every line of the story is made of: a line you open as a whole (no
// buttons on it), the sheet it opens, and how it names who and when.

import { Modal } from "@sixthshift/design-system/modal";
import type { ReactNode } from "react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { formatTime } from "../../../../lib/journal";

/** The name a line says when it isn't yours: "Sam". Yours says nothing, as a diary wouldn't. */
export function useOther(): (id: string | null) => string | null {
  const { data: people } = usePeopleQuery();
  return (id) => (id === null || id === people.me?.id ? null : (people.people.find((p) => p.id === id)?.name ?? null));
}

/** A sheet to change or delete what a line holds. */
export function EntrySheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3 px-6 pb-6">{children}</Modal.Body>
    </Modal>
  );
}

/** A line you can open: the whole line is the button, no buttons on it. */
export function Opens({ label, onOpen, children }: { label: string; onOpen: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="-mx-2 block w-[calc(100%+1rem)] rounded-md px-2 py-1 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      {children}
    </button>
  );
}

/** "— Sam", quietly after the words: only on a line that's someone's voice (a note, a letter, a feeling), never on her body's or the baby's. */
export function By({ name }: { name: string | null }) {
  return name ? <span className="text-sm text-fg-subtle"> — {name}</span> : null;
}

/** " · 9:40 pm". */
export function At({ time }: { time: string | null }) {
  return time ? <span className="text-sm text-fg-subtle"> · {formatTime(time)}</span> : null;
}

/** A person as a line names them: "You", their name, or "One of you" for someone no longer here. */
export function usePersonName(): (id: string) => string {
  const { data: people } = usePeopleQuery();
  return (id) => (id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? "One of you"));
}
