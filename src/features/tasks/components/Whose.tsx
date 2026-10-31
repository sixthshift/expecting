import { UserRound } from "lucide-react";
import type { Task } from "../../../content/schema";
import type { Person } from "../../../lib/people";
import { whose } from "../../../lib/people";

/**
 * Whose a task is, in its meta line, when it's one of you rather than both:
 * "Yours", "Sam's", "The birth parent's", marked with a person so it reads as
 * whose job it is rather than a word left hanging. Nothing for a job together.
 */
export function Whose({ who, me, people }: { who: Task["who"]; me: Person | null; people: readonly Person[] }) {
  if (who === "together") return null;
  return (
    <span className="inline-flex items-center gap-1">
      <UserRound aria-hidden size={12} />
      {whose(who, me, people)}
    </span>
  );
}
