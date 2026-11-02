import { cn } from "@sixthshift/design-system/utils";

/** A part of the page: its heading, then what's in it. */
export function Part({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-3", className)}>
      <h2 id={id} className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
