import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";

/**
 * Every page of the Library: one column at the pillar's width. Its home and
 * search sit under the pillar's header (`header`); a shelf and an entry,
 * which have their own way back and title, start under the phone's top edge.
 */
export function LibraryFrame({ header = false, children }: { header?: boolean; children: ReactNode }) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl px-4 pb-16 md:px-8", !header && "pt-[max(1rem,env(safe-area-inset-top))] lg:pt-8")}>
      {header ? <PillarHeader title="Library" lead="Everything Expecting knows, to read any time. Each piece also turns up on its week." /> : null}
      {children}
    </main>
  );
}
