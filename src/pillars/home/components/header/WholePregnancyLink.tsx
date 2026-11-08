import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useHomePage } from "../../contexts/HomePageContext";

/** The way to the timeline, open at the week peeked at. */
export function WholePregnancyLink() {
  const { week, peeking } = useHomePage();
  return (
    <Link
      to="/timeline"
      search={peeking && week !== null ? { at: week } : {}}
      className="flex min-h-11 items-center gap-1 text-sm font-medium text-fg-brand hover:underline"
    >
      The whole pregnancy
      <ChevronRight aria-hidden size={16} />
    </Link>
  );
}
