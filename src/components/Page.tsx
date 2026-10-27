import { Heading } from "@sixthshift/design-system/heading";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

/**
 * A screen away from the timeline (settings, login, not found): its heading,
 * an optional line under it, and its content.
 */
export function Page({ title, subtitle, aside, children }: { title: string; subtitle?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-10">
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

/** A titled group of content on a page. */
export function Section({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}
