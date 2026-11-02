import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";

/**
 * Every page of the Journal: the pillar's header, its two ways in (Timeline,
 * the story; and Collections), and the
 * page under them, one column at the pillar's width. The ways in are the
 * story, everything by time (`/journal`), and the collections, everything
 * by what it is (`/journal/collections`): links, so each is its own address
 * and back goes between them.
 */
export function JournalFrame({ current, children }: { current: "story" | "collections"; children: ReactNode }) {
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
            Timeline
          </Link>
          <Link to="/journal/collections" aria-current={current === "collections" ? "page" : undefined} className={tab(current === "collections")}>
            Collections
          </Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
