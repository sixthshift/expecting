import { UserRound } from "lucide-react";
import { usePeopleQuery } from "../../../api/rpc/people";
import type { Task } from "../../../content/schema";
import { whose } from "../../../lib/people";

/**
 * Whose a task is, in its meta line, when it's one of you rather than both:
 * "Yours", "Sam's", "The pregnant parent's", marked with a person so it reads as
 * whose job it is rather than a word left hanging. Nothing for a job together.
 */
export function Whose({ who }: { who: Task["who"] }) {
  const { data: people } = usePeopleQuery();
  if (who === "together") return null;
  return (
    <span className="inline-flex items-center gap-1">
      <UserRound aria-hidden size={12} />
      {whose(who, people.me, people.people)}
    </span>
  );
}
