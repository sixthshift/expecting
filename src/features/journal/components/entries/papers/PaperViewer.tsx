// One paper, opened: what it is and when, what it's about (its Library entry),
// its words, and its pages, a photographed one as big as the screen allows, a
// PDF as a tile that opens in the phone's own viewer. Kept handy or not in one
// tap; changed, downloaded, or deleted (asked first). Never what it says.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { Switch } from "@sixthshift/design-system/switch";
import { Download, ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { papersSaves, usePapers } from "../../../../../api/rpc/papers";
import { usePeople } from "../../../../../api/rpc/people";
import { useQuiet } from "../../../../../api/rpc/quiet";
import { useSettings } from "../../../../../api/rpc/settings";
import { useSave } from "../../../../../app/hooks/useSave";
import { useUploadSrc } from "../../../../../app/hooks/useUploadSrc";
import { isOnPhone } from "../../../../../app/model/uploads";
import { builtInItems } from "../../../../../content";
import type { ISODate } from "../../../../../lib/dates";
import { fileUrl, formatSize } from "../../../../../lib/files";
import { isPicturePage, type Paper, type PaperChange, type PaperPage } from "../../../../../lib/papers";
import { forgetFile } from "../../../../../pwa/register";
import { ItemLink } from "../../../../library/components/ItemLink";
import { when } from "../../../model/dates";
import { Picture } from "../photos/Picture";
import { complete, type PaperDraft, PaperFields } from "./PaperFields";
import { paperLine } from "./PaperRow";

/** A PDF page: its name and size, opened in a new tab (the phone's own viewer) or downloaded. */
function PdfPage({ page, label }: { page: PaperPage; label: string }) {
  // The phone's copy while it's still waiting to go up, else the server's (or the worker's, kept for a handy paper).
  const src = useUploadSrc(page.fileId, "original");
  const waiting = isOnPhone(page.fileId);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-normal p-3">
      <FileText aria-hidden size={28} className="shrink-0 text-fg-brand" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-fg-strong">{page.name}</span>
        <span className="text-xs text-fg-subtle">
          {label} · PDF, {formatSize(page.size)}
        </span>
      </div>
      {src ? (
        <Button asChild variant="outline" size="sm">
          <a href={src} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden size={16} /> Open
          </a>
        </Button>
      ) : null}
      {waiting ? null : (
        <Button asChild variant="ghost" size="sm" iconOnly>
          <a href={fileUrl(page.fileId, "original", { download: true })} download aria-label={`Download ${page.name}`}>
            <Download aria-hidden size={16} />
          </a>
        </Button>
      )}
    </div>
  );
}

/** A photographed page, as big as the screen allows, with its original to download. */
function PicturePage({ page, alt, label }: { page: PaperPage; alt: string; label: string }) {
  return (
    <figure className="flex flex-col gap-1">
      <Picture fileId={page.fileId} variant="display" alt={alt} className="max-h-[75vh] w-full rounded-md bg-bg-subtle object-contain" />
      <figcaption className="flex items-center justify-between gap-2 text-xs text-fg-subtle">
        {label}
        {isOnPhone(page.fileId) ? null : (
          <a href={fileUrl(page.fileId, "original", { download: true })} download className="flex min-h-11 items-center gap-1 underline">
            <Download aria-hidden size={14} /> Download
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/** Change what it is, its name, what it's about, its date, its words: never its pages. */
function ChangePaper({ paper, onDone }: { paper: Paper; onDone: () => void }) {
  const edit = useSave(papersSaves.editPaper);
  const { data: quiet } = useQuiet();
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

/** A paper's change: what it is now, with `fields` changed. */
function changeOf(paper: Paper, fields: Partial<PaperChange> = {}): PaperChange {
  const { id, kind, title, itemId, day, note, handy } = paper;
  return { id, kind, title, itemId, day, note, handy, ...fields };
}

/**
 * One paper, opened by its id. Read from the papers as they are now, so one
 * the other phone deletes closes. Deleting asks first: every page goes from
 * both phones, with nothing to put back.
 */
export function PaperViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: papers } = usePapers();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const edit = useSave(papersSaves.editPaper);
  const remove = useSave(papersSaves.deletePaper);
  const [changing, setChanging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const paper = papers.find((p) => p.id === id);
  const name = (who: string | null) => (who === null ? null : who === people.me?.id ? "You" : (people.people.find((p) => p.id === who)?.name ?? null));

  // Deleted, here or on the other phone: nothing left to show.
  useEffect(() => {
    if (!paper) onClose();
  }, [paper, onClose]);
  if (!paper) return null;

  const item = paper.itemId ? builtInItems.find((i) => i.id === paper.itemId && !i.private) : undefined;
  const changer = paper.editedAt && paper.editedBy !== paper.by ? name(paper.editedBy) : null;
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
              {[
                name(paper.by),
                `kept ${when(paper.createdAt.slice(0, 10), null).replace(/^Today/, "today")}`,
                changer ? `changed by ${changer === "You" ? "you" : changer}` : paper.editedAt ? "changed" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {paper.pages.some((p) => isOnPhone(p.fileId)) ? <p className="text-xs text-fg-subtle">Still on this phone: it goes up as soon as it can.</p> : null}
            {confirming ? (
              <div role="alert" className="flex flex-col gap-2 rounded-lg border border-border-normal p-3">
                <p className="text-sm text-fg-strong">Delete this paper? Every page goes from both phones, and can't be put back.</p>
                <div className="flex gap-2">
                  <Button intent="danger" size="sm" onClick={() => deleteIt(paper)}>
                    Delete it
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Keep it
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                <Button variant="ghost" size="sm" onClick={() => setChanging(true)}>
                  <Pencil aria-hidden size={16} /> Change
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                  <Trash2 aria-hidden size={16} /> Delete
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
