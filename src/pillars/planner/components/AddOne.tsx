import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { cn } from "@sixthshift/design-system/utils";
import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

/**
 * Something of your own in one line (a task, a line on a list, a list): its
 * words, from `start` if given, and the way to add them, a "+" named `add`
 * (or, with `addText`, a button saying it). Nothing until there are words;
 * `onAdd` with them, then the box is cleared for the next.
 */
export function AddOne({
  label,
  placeholder,
  add,
  addText = false,
  start = "",
  className,
  onAdd,
}: {
  label: string;
  placeholder: string;
  add: string;
  addText?: boolean;
  start?: string;
  className?: string;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState(start.slice(0, 200));
  const empty = title.trim().length === 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (empty) return;
    onAdd(title);
    setTitle("");
  }

  return (
    <form onSubmit={submit} className={cn("flex gap-2", className)}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={placeholder} aria-label={label} maxLength={200} className="flex-1" />
      {addText ? (
        <Button type="submit" variant="outline" disabled={empty}>
          {add}
        </Button>
      ) : (
        <Button type="submit" variant="outline" iconOnly aria-label={add} disabled={empty}>
          <Plus aria-hidden size={16} />
        </Button>
      )}
    </form>
  );
}
