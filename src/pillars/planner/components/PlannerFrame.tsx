import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { PutAwayNotice } from "../../../app/features/quiet/components/PutAwayNotice";

/** Where a page of the Planner goes back to: the Planner, the lists, or It's time (the bag's). */
type Back = { to: "/planner" | "/planner/lists" | "/its-time"; label: string };

/**
 * Every page of the Planner past its own (the weeks, the lists, a list): the
 * column, the way back, and its title and what it's for (a list draws its
 * own title). While something has happened, what's put away says so in place
 * of the page (`putAway`, as `PutAwayNotice` takes it). `className` spaces the
 * column.
 */
export function PlannerFrame({
  back = { to: "/planner", label: "Planner" },
  title,
  lead,
  putAway,
  className = "gap-6",
  children,
}: {
  back?: Back;
  title?: string;
  lead?: string;
  putAway: { subject: string; are?: boolean; aside?: boolean };
  className?: string;
  children: ReactNode;
}) {
  const { data: quiet } = useQuietQuery();
  const backLink = (
    <Link
      to={back.to}
      className={cn("-ml-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal", title ? "mb-4" : "-mb-2")}
    >
      <ArrowLeft aria-hidden size={16} /> {back.label}
    </Link>
  );
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className={cn("flex flex-col", className)}>
        {title ? (
          <div>
            {backLink}
            <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{title}</h1>
            {lead ? <p className="mt-1 max-w-prose text-fg-subtle">{lead}</p> : null}
          </div>
        ) : (
          backLink
        )}
        {quiet ? <PutAwayNotice {...putAway} className="max-w-prose" /> : children}
      </div>
    </main>
  );
}
