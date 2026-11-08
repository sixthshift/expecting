import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown } from "lucide-react";
import { type ReactNode, type Ref, useId, useState } from "react";

/**
 * A card folded to one line, its title and what's in it (`summary`), that
 * opens in place to show the rest under it. Controlled: whoever draws it
 * says whether it's open. `quietHeading` keeps the first heading of what's
 * inside for a screen reader only, when the card's own line already says it.
 * The card's line is a heading holding the button.
 * It opens and closes by sliding (its row from none of the content's height
 * to all of it, `starting:` for the first frame), still where motion is
 * reduced; closed, what's inside is gone once it has slid shut.
 */
export function CollapsibleCard({
  title,
  summary,
  open,
  onToggle,
  quietHeading = false,
  ref,
  className,
  children,
}: {
  title: string;
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  quietHeading?: boolean;
  ref?: Ref<HTMLElement>;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  // Drawn while open and while sliding shut; gone once shut.
  const [drawn, setDrawn] = useState(open);
  if (open && !drawn) setDrawn(true);
  return (
    <section ref={ref} aria-labelledby={id} className={cn("scroll-mt-4 rounded-xl border border-border-subtle bg-bg-normal", className)}>
      <h2 id={id}>
        <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-12 w-full items-center gap-2 px-4 py-3 text-left">
          <span className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-fg-strong">{title}</span>
            {summary ? <span className="text-sm text-fg-subtle"> {summary}</span> : null}
          </span>
          <ChevronDown aria-hidden size={18} className={cn("shrink-0 text-fg-subtle transition-transform duration-200", open && "rotate-180")} />
        </button>
      </h2>
      {drawn ? (
        <div
          inert={!open}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "grid-template-rows" && !open) setDrawn(false);
          }}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none starting:grid-rows-[0fr] starting:opacity-0",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "flex flex-col gap-4 px-4 pb-4 empty:hidden",
                quietHeading && "[&>section>h2:first-child]:sr-only [&>section>h3:first-child]:sr-only"
              )}
            >
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
