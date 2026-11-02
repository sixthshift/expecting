import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ExtraId } from "../../../settings/model/extras";
import { ComesWith } from "../ComesWith";

/**
 * A tool that's off, in the Drawer: what it is (`children`, a sentence or
 * two), and the extras it comes with, with the way to settings.
 */
export function ToolOff({ icon: Icon, title, extras, children }: { icon: LucideIcon; title: string; extras: readonly ExtraId[]; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex max-w-3xl items-start gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <Icon aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
      <p className="text-sm text-fg-normal">
        <span className="font-medium text-fg-strong">{title}:</span> {children} <ComesWith extras={extras} />
      </p>
    </section>
  );
}
