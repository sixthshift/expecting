import { cn } from "@sixthshift/design-system/utils";
import { isBuiltInItemId, isPrivateItem } from "../../../../content";
import { AskCard } from "../../../planner/features/questions/components/AskCard";
import { useEntryHere } from "../../contexts/LibraryItemPageContext";

/** `{% ask "…" /%}`: a question worth asking at an appointment, remembering the entry it's on. */
export function Ask({ primary: text, className }: { primary: string; className?: string }) {
  const here = useEntryHere();
  // Never a private one's: the server refuses it, and it would be a trace.
  const itemId = here !== undefined && isBuiltInItemId(here) && !isPrivateItem(here) ? here : undefined;
  return <AskCard text={text} itemId={itemId} className={cn("mt-3", className)} />;
}
