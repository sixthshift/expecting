import { Link } from "@tanstack/react-router";
import { ChevronRight, MessageCircleQuestion } from "lucide-react";

/** Questions waiting: for the next appointment (`next`), or for one yet to be booked; they live in the Planner. */
export function QuestionsWaiting({ count, next }: { count: number; next: boolean }) {
  return (
    <Link to="/planner/questions" className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal">
      <MessageCircleQuestion aria-hidden size={16} className="text-fg-brand" />
      {count === 1 ? "1 question" : `${count} questions`} {next ? "for the next appointment" : "waiting for an appointment"}
      <ChevronRight aria-hidden size={16} />
    </Link>
  );
}
