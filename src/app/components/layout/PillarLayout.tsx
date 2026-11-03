import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { AppPath } from "../../model/paths";
import { PhoneCorner } from "./AppLayout";

const WIDTH = { "2xl": "max-w-2xl", "3xl": "max-w-3xl", "6xl": "max-w-6xl" } as const;

/** Where a page goes back to, and what that's called: `{ to: "/drawer", label: "The Drawer" }`. */
export type Back = { to: AppPath; label: string };

/**
 * Every page inside a pillar, drawn inside the app's layout: one column at
 * the page's `width`, its top, then the page.
 *
 * The top is one of three:
 * - a pillar's own page: its `title` and `lead`, and on a phone the corner
 *   (It's time, the call button, Emergency info, settings);
 * - a page under it (`back`): the way back, then its `title` and `lead`, if
 *   it doesn't draw its own;
 * - neither: the page draws its own top (This week's hero, a Library entry).
 *
 * `head` goes under the lead (the timeline's search). `className` spaces the
 * page's column. It never asks whether something has happened: a page that's
 * put away then is its route's quiet world (`putAway`, src/app/features/quiet/).
 */
export function PillarLayout({
  title,
  lead,
  back,
  head,
  width = "6xl",
  className,
  children,
}: {
  title?: string;
  lead?: ReactNode;
  back?: Back;
  head?: ReactNode;
  width?: keyof typeof WIDTH;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className={cn("mx-auto w-full px-4 pb-16 md:px-8", WIDTH[width])}>
      {back ? (
        <header className={cn("flex flex-col gap-1 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-8", title ? "pb-5 lg:pb-8" : "pb-3")}>
          <Link
            to={back.to}
            className={cn(
              "-ml-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal print:hidden",
              title && "mb-3"
            )}
          >
            <ArrowLeft aria-hidden size={16} /> {back.label}
          </Link>
          {title ? <Heading title={title} lead={lead} /> : null}
          {head}
        </header>
      ) : title ? (
        <header className="flex flex-col gap-1 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5 lg:pt-10 lg:pb-8">
          <div className="flex items-start justify-between gap-3">
            <Heading title={title} lead={lead} />
            <PhoneCorner />
          </div>
          {head}
        </header>
      ) : null}
      <div className={cn("flex min-w-0 flex-col", className)}>{children}</div>
    </main>
  );
}

function Heading({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{title}</h1>
      {lead ? <p className="max-w-prose text-fg-subtle">{lead}</p> : null}
    </div>
  );
}
