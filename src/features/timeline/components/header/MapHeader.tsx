import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/** The map's top: the way back to This week, where it's opened from, and its name. */
export function MapHeader({ lead, children }: { lead?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1 pt-[max(1rem,env(safe-area-inset-top))] pb-5 lg:pt-8 lg:pb-8">
      <Link to="/" className="-ml-2 mb-3 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
        <ArrowLeft aria-hidden size={16} /> This week
      </Link>
      <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">The whole pregnancy</h1>
      {lead ? <p className="max-w-prose text-fg-subtle">{lead}</p> : null}
      {children}
    </header>
  );
}
