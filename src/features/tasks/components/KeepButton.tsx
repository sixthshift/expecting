import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFirsts } from "../../../api/rpc/firsts";
import { useQuiet } from "../../../api/rpc/quiet";
import type { Keeps } from "../../../content/schema";
import { CaptureSheet } from "../../capture/components/CaptureSheet";

/** What the button says, by what the task keeps. */
const LABEL = { letter: "Write it", photo: "Add it", first: "Mark it" } as const;

/**
 * The way from a task to what doing it keeps (`keeps` in its frontmatter): the
 * "+" opened at a letter to the baby, a photo, or its first, kept, the task is
 * ticked (`onKept`); or the view of Your people it fills, opened, the task left
 * to tick when it's done. Ticking still works without it: keeping is offered,
 * never required. Not while something has happened, and not for a first
 * already marked or put aside.
 */
export function KeepButton({ keeps, onKept }: { keeps: Keeps; onKept: () => void }) {
  const { data: quiet } = useQuiet();
  const { data: firsts } = useFirsts();
  const [open, setOpen] = useState(false);
  if (quiet) return null;
  if (typeof keeps === "object" && "people" in keeps)
    return (
      <Button asChild variant="ghost" size="sm" className="shrink-0">
        <Link to="/drawer/people" search={{ view: keeps.people }}>
          Open the list
        </Link>
      </Button>
    );
  const first = typeof keeps === "object" ? keeps.first : undefined;
  if (first && firsts.some((m) => m.key === first)) return null;
  const kind = first ? "first" : (keeps as "letter" | "photo");

  return (
    <>
      <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setOpen(true)}>
        {LABEL[kind]}
      </Button>
      {open ? (
        <CaptureSheet initial={kind === "letter" ? "note" : kind} letter={kind === "letter"} first={first} onKept={onKept} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
