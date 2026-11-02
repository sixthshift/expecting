// Changing a paper: what it is and when, what it's about and its words.

import { Button } from "@sixthshift/design-system/button";
import { type FormEvent, useState } from "react";
import { papersSaves } from "../../../../../../api/rpc/papers";
import { useQuietQuery } from "../../../../../../api/rpc/quiet";
import { useSave } from "../../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../../lib/dates";
import type { Paper } from "../../../../../../lib/journal/papers";
import { changeOf } from "../../model/change";
import { complete, type PaperDraft, PaperFields } from "../PaperFields";

/** Change what it is, its name, what it's about, its date, its words: never its pages. */
export function ChangePaper({ paper, onDone }: { paper: Paper; onDone: () => void }) {
  const edit = useSave(papersSaves.editPaper);
  const { data: quiet } = useQuietQuery();
  const [draft, setDraft] = useState<PaperDraft>({
    kind: paper.kind,
    itemId: paper.itemId,
    title: paper.title,
    titled: true,
    day: paper.day as ISODate,
    choosingDay: true,
    note: paper.note ?? "",
    handy: paper.handy,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete(draft)) return;
    edit(
      changeOf(paper, {
        kind: draft.kind,
        itemId: draft.itemId,
        title: draft.title.trim(),
        day: draft.day,
        note: draft.note.trim() || null,
        handy: Boolean(draft.handy),
      })
    );
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <PaperFields draft={draft} onChange={setDraft} quiet={quiet?.kind ?? null} />
      <div className="flex gap-2">
        <Button type="submit" intent="brand" size="sm" disabled={!complete(draft)}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
