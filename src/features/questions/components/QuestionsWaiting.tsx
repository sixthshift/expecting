import { Link } from "@tanstack/react-router";
import { ChevronRight, MessageCircleQuestion } from "lucide-react";

/** Questions waiting for the next appointment: they live in the Planner. */
export function QuestionsWaiting({ count }: { count: number }) {
  return (
    <Link to="/planner" hash="questions" className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal">
      <MessageCircleQuestion aria-hidden size={16} className="text-fg-brand" />
      {count === 1 ? "1 question" : `${count} questions`} for the next appointment
      <ChevronRight aria-hidden size={16} />
    </Link>
  );
}
