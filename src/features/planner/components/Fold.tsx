import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

/** A titled run of rows with its count: open as a heading, or `folded` behind a button that opens it. */
export function Fold({ title, count, folded = false, children }: { title: string; count: number; folded?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!folded);
  const heading = (
    <>
      <span>{title}</span>
      <span className="font-normal text-fg-subtle">{count}</span>
    </>
  );
  return (
    <div className="flex flex-col gap-1">
      {folded ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-fg-normal"
        >
          {heading}
          <ChevronDown aria-hidden size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      ) : (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg-normal">{heading}</h3>
      )}
      {open ? <div className="flex flex-col">{children}</div> : null}
    </div>
  );
}
