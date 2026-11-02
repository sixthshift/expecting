import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReadyThing } from "../../model/ready";

/** One thing the night still needs: a tap to where it's filled in. */
export function ThingLink({ thing }: { thing: ReadyThing }) {
  const cls = "flex min-h-12 items-center justify-between gap-3 px-4 text-fg-normal hover:text-fg-strong";
  const inner = (
    <>
      {thing.text}
      <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
    </>
  );
  if (thing.to === "bag")
    return (
      <Link to="/planner/lists/$listId" params={{ listId: "bag" }} className={cls}>
        {inner}
      </Link>
    );
  return (
    <Link to={thing.to === "planner" ? "/planner" : "/emergency"} className={cls}>
      {inner}
    </Link>
  );
}
