import { cn } from "@sixthshift/design-system/utils";

/**
 * A shape standing in for what's on its way: a soft block where words or a
 * card will be, breathing gently. For a page whose layout is known, so it
 * opens in its own shape instead of on a blank; the stork (Loading) is for
 * the app's first start, when there's no page yet to stand in for.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-bg-subtle motion-reduce:animate-none", className)} />;
}

/** Lines of text still to come: full width, the last one short, as a paragraph ends. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders, never reordered
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/**
 * A pillar's page still loading, in the frame: its heading, a line under it,
 * then cards, in the page's own width and gutters (as PillarHeader and the
 * pages lay them out). Said once to a screen reader.
 */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto w-full max-w-6xl px-4 md:px-8">
      <div className="flex flex-col gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10 lg:pb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col gap-4 rounded-xl border border-border-subtle p-4">
            <Skeleton className="h-5 w-1/2" />
            <SkeletonText lines={4} />
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border-subtle p-4">
            <Skeleton className="h-5 w-2/5" />
            <SkeletonText lines={2} />
          </div>
        </div>
        <div className="hidden flex-col gap-3 lg:flex">
          <Skeleton className="h-5 w-28" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-5 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
