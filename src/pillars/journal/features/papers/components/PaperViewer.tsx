// One paper, opened: what it is and when, what it's about (its Library entry),
// its words, and its pages, a photographed one as big as the screen allows, a
// PDF as a tile that opens in the phone's own viewer. Kept handy or not in one
// tap; changed, downloaded, or deleted (asked first). Never what it says.

import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { Switch } from "@sixthshift/design-system/switch";
import { useEffect, useState } from "react";
import { papersSaves, usePapersQuery } from "../../../../../api/rpc/papers";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import { useSave } from "../../../../../app/hooks/useSave";
import { isOnPhone } from "../../../../../app/model/uploads";
import { builtInItems } from "../../../../../content";
import { isPicturePage, type Paper } from "../../../../../lib/journal/papers";
import { when } from "../../../../../lib/labels";
import { nameBy } from "../../../../../lib/people";
import { forgetFile } from "../../../../../pwa/register";
import { ItemLink } from "../../../../library/components/itemLink/ItemLink";
import { ChangeOrDelete } from "../../../components/ChangeOrDelete";
import { changedBy } from "../../../model/labels";
import { changeOf } from "../model/change";
import { paperLine } from "./PaperRow";
import { ChangePaper } from "./viewer/ChangePaper";
import { PdfPage } from "./viewer/PdfPage";
import { PicturePage } from "./viewer/PicturePage";

/**
 * One paper, opened by its id. Read from the papers as they are now, so one
 * the other phone deletes closes. Deleting asks first: every page goes from
 * both phones, with nothing to put back.
 */
export function PaperViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: papers } = usePapersQuery();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const edit = useSave(papersSaves.editPaper);
  const remove = useSave(papersSaves.deletePaper);
  const [changing, setChanging] = useState(false);
  const paper = papers.find((p) => p.id === id);
  const name = (who: string | null) => nameBy(who, people.me, people.people);

  // Deleted, here or on the other phone: nothing left to show.
  useEffect(() => {
    if (!paper) onClose();
  }, [paper, onClose]);
  if (!paper) return null;

  const item = paper.itemId ? builtInItems.find((i) => i.id === paper.itemId && !i.private) : undefined;
  const total = paper.pages.length;
  const pageLabel = (i: number) => (total > 1 ? `Page ${i + 1} of ${total}` : "The page");

  function deleteIt(target: Paper) {
    remove({ id: target.id });
    for (const page of target.pages) void forgetFile(page.fileId);
    toast({ title: "Paper deleted" });
    onClose();
  }

  return (
    <Modal size="lg" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={paper.title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{paper.title}</h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3 px-6 pb-6">
        {changing ? (
          <ChangePaper paper={paper} onDone={() => setChanging(false)} />
        ) : (
          <>
            <p className="text-sm text-fg-normal">{paperLine(paper, settings.dueDate)}</p>
            {item ? (
              <p className="text-sm text-fg-normal">
                About:{" "}
                <ItemLink itemId={item.id} className="font-medium text-fg-brand underline">
                  {item.title}
                </ItemLink>
              </p>
            ) : null}
            {paper.note ? <p className="whitespace-pre-wrap text-fg-normal">{paper.note}</p> : null}
            <Switch label="Keep handy" checked={paper.handy} onCheckedChange={(on) => edit(changeOf(paper, { handy: on }))} />
            <ol aria-label="Pages" className="flex flex-col gap-4">
              {paper.pages.map((page, i) => (
                <li key={page.fileId}>
                  {isPicturePage(page) ? (
                    <PicturePage page={page} alt={`${paper.title}, ${pageLabel(i).toLowerCase()}`} label={pageLabel(i)} />
                  ) : (
                    <PdfPage page={page} label={pageLabel(i)} />
                  )}
                </li>
              ))}
            </ol>
            <p className="text-xs text-fg-subtle">
              {[name(paper.by), `kept ${when(paper.createdAt.slice(0, 10), null).replace(/^Today/, "today")}`, changedBy(paper, people.me, people.people)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {paper.pages.some((p) => isOnPhone(p.fileId)) ? <p className="text-xs text-fg-subtle">Still on this phone: it goes up as soon as it can.</p> : null}
            <ChangeOrDelete
              asks="Delete this paper? Every page goes from both phones, and can't be put back."
              onChange={() => setChanging(true)}
              onDelete={() => deleteIt(paper)}
            />
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
