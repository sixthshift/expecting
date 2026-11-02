import type { ReactNode } from "react";
import { TimelineHeader } from "./header/TimelineHeader";

/**
 * The timeline's page, as it is and while paused: its column at the pillar's
 * width, the header (the way back to This week, and its name), then the page.
 */
export function TimelineFrame({ lead, head, children }: { lead?: string; head?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
      <TimelineHeader lead={lead}>{head}</TimelineHeader>
      {children}
    </main>
  );
}
