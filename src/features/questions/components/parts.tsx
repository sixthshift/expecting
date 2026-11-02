// What an open and an asked question share: where it came from, and the way to delete it.

import { Button } from "@sixthshift/design-system/button";
import { Trash2 } from "lucide-react";
import { usePeopleQuery } from "../../../api/rpc/people";
import { questionsSaves } from "../../../api/rpc/questions";
import { useSave } from "../../../app/hooks/useSave";
import { builtInItems } from "../../../content";
import { whoseBy } from "../../../lib/people";
import type { Question } from "../../../lib/questions";
import { ItemLink } from "../../library/components/itemLink/ItemLink";

/**
 * "from *Anaemia and low iron* · Sam's": the entry it was asked from, and whose it is; nothing when neither is known.
 * A discreet entry isn't named: its title would say what the question's words don't.
 */
export function Source({ question }: { question: Question }) {
  const { me, people } = usePeopleQuery().data;
  // A private entry never sends one (src/server/privacy/); this only makes sure none is drawn.
  const item = question.itemId ? builtInItems.find((i) => i.id === question.itemId && !i.private && !i.discreet) : undefined;
  const whose = whoseBy(question.by, me, people);
  if (!item && !whose) return null;
  return (
    <p className="mt-1 text-xs text-fg-subtle">
      {item ? (
        <>
          from{" "}
          <ItemLink itemId={item.id} className="italic underline hover:text-fg-normal">
            {item.title}
          </ItemLink>
        </>
      ) : null}
      {item && whose ? " · " : null}
      {whose}
    </p>
  );
}

export function DeleteButton({ id, text }: { id: string; text: string }) {
  const remove = useSave(questionsSaves.deleteQuestion);
  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${text}"`} onClick={() => remove({ id })}>
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
