import { CircleCheck } from "lucide-react";

/** An entry you've opened before: a quiet tick beside it, said aloud as "Read". */
export function ReadMark() {
  return (
    <span title="Read" className="inline-flex shrink-0 items-center text-fg-subtle">
      <CircleCheck aria-hidden size={16} />
      <span className="sr-only">Read</span>
    </span>
  );
}
