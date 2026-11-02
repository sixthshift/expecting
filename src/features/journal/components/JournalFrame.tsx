import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";

/**
 * Every page of the Journal: the pillar's header, its two ways in, and the
 * page under them, one column at the pillar's width. The ways in are the
 * story, to read back (`/journal`), and the records, to look something up
 * (`/journal/records`): links, so each is its own address and back goes
 * between them.
 */
export function JournalFrame({ current, children }: { current: "story" | "records"; children: ReactNode }) {
  const tab = (active: boolean) =>
    cn(
      "flex min-h-10 items-center rounded-full px-4 text-sm font-medium",
      active ? "bg-bg-brand-subtle text-fg-strong" : "text-fg-subtle hover:bg-bg-normal-hovered hover:text-fg-normal"
    );
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex min-w-0 flex-col gap-6">
        <nav aria-label="Journal" className="flex gap-1">
          <Link to="/journal" aria-current={current === "story" ? "page" : undefined} className={tab(current === "story")}>
            Story
          </Link>
          <Link to="/journal/records" aria-current={current === "records" ? "page" : undefined} className={tab(current === "records")}>
            Records
          </Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
