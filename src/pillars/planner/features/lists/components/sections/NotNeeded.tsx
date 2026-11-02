import { Card } from "@sixthshift/design-system/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Line } from "../../../../../../content/schema";
import { ListLine } from "../line/ListLine";

/** The lines marked not needed, at the list's foot, folded. */
export function NotNeeded({ lines }: { lines: readonly Line[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex min-h-11 w-fit items-center gap-1 text-sm font-semibold text-fg-subtle hover:text-fg-normal"
      >
        {open ? <ChevronDown aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />}
        Not needed ({lines.length})
      </button>
      {open ? (
        <Card size="md">
          {lines.map((line) => (
            <ListLine key={line.id} line={line} />
          ))}
        </Card>
      ) : null}
    </section>
  );
}
