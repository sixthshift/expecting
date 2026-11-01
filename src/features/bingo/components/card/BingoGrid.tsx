import { cn } from "@sixthshift/design-system/utils";
import { Check, Heart } from "lucide-react";
import { useState } from "react";
import { type Card, cells, squareOf, standing } from "../../../../lib/bingo";
import { SquareSheet } from "./SquareSheet";

const LETTERS = ["B", "I", "N", "G", "O"];

/**
 * A card: B-I-N-G-O over the 5×5 grid, the free centre, each marked square
 * stamped and each complete line lit. A square opens its sheet: to mark,
 * change or unmark on your own card (`own`), to read on the other's.
 */
export function BingoGrid({ card, owner, own, other }: { card: Card; owner: string; own: boolean; other: { name: string; card: Card | null } }) {
  const [open, setOpen] = useState<string | null>(null);
  const placed = cells(card.squares);
  const marked = new Set(card.marks.map((m) => m.squareId));
  const lit = new Set(standing(card).lines.flat());

  return (
    <div className="flex flex-col gap-1">
      <div aria-hidden className="grid grid-cols-5 gap-1 text-center font-display text-xl font-bold text-fg-brand lg:text-2xl">
        {LETTERS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <ul aria-label={own ? "Your card" : `${owner}'s card`} className="grid grid-cols-5 gap-1">
        {placed.map((id, place) =>
          id === null ? (
            <li
              key="free"
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md bg-bg-brand-strong p-1 text-center text-fg-on-brand-strong"
            >
              <Heart aria-hidden size={18} className="fill-current" />
              <span className="text-[10px] font-semibold uppercase lg:text-xs">Free</span>
            </li>
          ) : (
            <li key={id}>
              <button
                type="button"
                onClick={() => setOpen(id)}
                aria-label={`${squareOf(id)?.text ?? id}${marked.has(id) ? ", marked" : ""}`}
                aria-pressed={marked.has(id)}
                className={cn(
                  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border p-1 text-center text-[10px] leading-tight hyphens-auto sm:text-xs lg:p-2 lg:text-sm",
                  marked.has(id)
                    ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle"
                    : "border-border-subtle bg-bg-normal text-fg-normal hover:bg-bg-normal-hovered",
                  lit.has(place) && "ring-2 ring-border-brand ring-offset-1"
                )}
              >
                <span className={cn(marked.has(id) && "opacity-60")}>{squareOf(id)?.text}</span>
                {marked.has(id) ? (
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-8 -rotate-12 items-center justify-center rounded-full border-2 border-fg-brand text-fg-brand lg:size-11">
                      <Check size={18} strokeWidth={3} />
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          )
        )}
      </ul>
      {open ? <SquareSheet squareId={open} card={card} own={own} other={other} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
