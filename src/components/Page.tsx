import { Heading } from "@sixthshift/design-system/heading";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

/**
 * A screen: its heading, an optional line under it, and its content. Full
 * width on a phone; on a larger screen it widens to the desktop container and
 * each page lays its content out for the room (see `Columns`).
 */
export function Page({ title, subtitle, aside, children }: { title: string; subtitle?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-28 md:px-8 lg:pt-10 lg:pb-12">
      <header className="mb-5 flex items-start justify-between gap-3 lg:mb-8">
        <div>
          <Heading as="h1">{title}</Heading>
          {subtitle ? <div className="mt-1 text-fg-subtle">{subtitle}</div> : null}
        </div>
        {aside}
      </header>
      <div className="flex flex-col gap-6">{children}</div>
    </main>
  );
}

/**
 * The desktop layout most screens use: a main column and a side panel. On a
 * phone they stack with the side panel first, because it holds what needs
 * doing now (what has slipped, the form to add to a list); from `lg` the panel
 * moves to the right and stays in view while the main column scrolls.
 */
export function Columns({ main, side, sideLabel }: { main: ReactNode; side: ReactNode; sideLabel?: string }) {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
      <aside aria-label={sideLabel} className="flex flex-col gap-6 lg:sticky lg:top-10 lg:order-last">
        {side}
      </aside>
      <div className="flex min-w-0 flex-col gap-6">{main}</div>
    </div>
  );
}

/** A titled group of content on a page. */
export function Section({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}
