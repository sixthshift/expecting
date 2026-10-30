// A result or a paper: photograph it (a page a photo) or choose it (a PDF, or
// photos), say what it is, and keep it. On a phone the camera is one tap, and
// "Another page" is the camera again; on a desktop a drop target. Every page is
// made ready and kept on the phone (src/app/model/uploads.ts) before the save,
// so one kept in a ward with no signal goes up later and is never lost.

import { Button } from "@sixthshift/design-system/button";
import { FileDropzone } from "@sixthshift/design-system/file-dropzone";
import { Spinner } from "@sixthshift/design-system/spinner";
import { Camera, FilePlus, FileText, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { papersSaves } from "../../../../api/rpc/papers";
import { useQuiet } from "../../../../api/rpc/quiet";
import { useSave } from "../../../../app/hooks/useSave";
import { FileProblemError, keepOnPhone, type Prepared, prepareFile, previewUrl } from "../../../../app/model/uploads";
import { type FileProblem, formatSize, isImage, MAX_ORIGINAL } from "../../../../lib/files";
import { newId } from "../../../../lib/outbox";
import { MAX_PAGES, type PaperPage, paperProblem } from "../../../../lib/papers";
import { complete, handyOf, newDraft, PaperFields } from "./PaperFields";

/** A page made ready, with its preview while it's on screen here. */
type Sheet = Prepared & { preview: string | null };

const ACCEPT = "image/*,application/pdf";

/** A file input dressed as a button: the phone's camera, or its picker. */
function Pick({
  label,
  icon: Icon,
  camera = false,
  primary = false,
  size = "lg",
  onFiles,
}: {
  label: string;
  icon: typeof Camera;
  camera?: boolean;
  primary?: boolean;
  size?: "sm" | "lg";
  onFiles: (files: File[]) => void;
}) {
  function picked(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // So choosing the same file again still counts.
    event.target.value = "";
    onFiles(files);
  }
  return (
    <Button asChild intent={primary ? "brand" : undefined} variant={primary ? undefined : "outline"} size={size}>
      <label className="cursor-pointer focus-within:ring-2 focus-within:ring-border-focus">
        <Icon aria-hidden size={size === "lg" ? 20 : 16} />
        {label}
        <input
          type="file"
          accept={camera ? "image/*" : ACCEPT}
          capture={camera ? "environment" : undefined}
          multiple={!camera}
          className="sr-only"
          onChange={picked}
        />
      </label>
    </Button>
  );
}

/**
 * Photograph a paper or choose it, page by page if it takes more than one,
 * then what it is, what it's about, its name, its date, and whether it's
 * handy. `onAdded` once kept (the capture sheet closes).
 */
export function AddPaper({ onAdded }: { onAdded?: () => void }) {
  const add = useSave(papersSaves.addPaper);
  const { data: quietNow } = useQuiet();
  const quiet = quietNow?.kind ?? null;
  const [pages, setPages] = useState<Sheet[]>([]);
  const [readying, setReadying] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => newDraft());
  const [keeping, setKeeping] = useState(false);
  // Every preview this form made, let go with it: pages come and go one at a time.
  const previews = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url);
    },
    []
  );

  function reset() {
    for (const url of previews.current) URL.revokeObjectURL(url);
    previews.current = [];
    setPages([]);
    setProblem(null);
    setDraft(newDraft());
  }

  async function ready(files: File[]) {
    if (files.length === 0) return;
    setReadying(true);
    setProblem(null);
    const made: Sheet[] = [];
    const problems: FileProblem[] = [];
    for (const file of files) {
      try {
        const prepared = await prepareFile(file);
        const preview = isImage(prepared.type) ? previewUrl(prepared) : null;
        if (preview) previews.current.push(preview);
        made.push({ ...prepared, preview });
      } catch (error) {
        problems.push(error instanceof FileProblemError ? error.problem : "unreadable");
      }
    }
    setPages((kept) => [...kept, ...made].slice(0, MAX_PAGES));
    setReadying(false);
    const first = problems[0];
    if (first) setProblem(made.length > 0 || pages.length > 0 ? `${paperProblem(first)} The rest are here.` : paperProblem(first));
  }

  function takeOut(index: number) {
    const page = pages[index];
    if (page?.preview) URL.revokeObjectURL(page.preview);
    setPages((kept) => kept.filter((_, i) => i !== index));
  }

  async function keep(event: FormEvent) {
    event.preventDefault();
    if (!complete(draft) || pages.length === 0 || keeping) return;
    setKeeping(true);
    try {
      const kept: PaperPage[] = [];
      for (const page of pages) {
        const fileId = newId();
        // On the phone first: the save that sends it may wait a long time for a connection.
        await keepOnPhone(fileId, page);
        kept.push({ fileId, type: page.type, name: page.name, size: page.size });
      }
      add({
        id: newId(),
        kind: draft.kind,
        title: draft.title.trim(),
        itemId: draft.itemId,
        day: draft.day,
        note: draft.note.trim() || null,
        handy: handyOf(draft, quiet),
        pages: kept,
      });
    } finally {
      setKeeping(false);
    }
    reset();
    onAdded?.();
  }

  const status = readying ? (
    <p className="flex min-h-12 items-center gap-2 text-sm text-fg-subtle" role="status">
      <Spinner size="sm" /> Getting it ready…
    </p>
  ) : null;
  const alert = problem ? (
    <p role="alert" className="text-sm text-fg-danger">
      {problem}
    </p>
  ) : null;

  if (pages.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {status ?? (
          <>
            {/* A phone: the camera, one tap, and the phone's own picker beside it (Files, for a PDF from an email). */}
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              <Pick label="Photograph it" icon={Camera} camera primary onFiles={(files) => void ready(files)} />
              <Pick label="Choose a file" icon={FileText} onFiles={(files) => void ready(files)} />
            </div>
            {/* A desktop: drop them in, or choose. */}
            <FileDropzone
              className="hidden lg:flex"
              size="sm"
              accept={ACCEPT}
              multiple
              maxSize={MAX_ORIGINAL}
              label="Drop a PDF or photos of the pages here, or choose them"
              hint="Several photos make one paper, a page each. PDF, JPEG, PNG or HEIC, up to 30 MB each."
              onFilesChange={(files) => void ready(files)}
              onFilesRejected={(rejected) => setProblem(paperProblem(rejected[0]?.reason === "size" ? "big" : "type"))}
            />
          </>
        )}
        {alert}
      </div>
    );
  }

  return (
    <form onSubmit={keep} className="flex flex-col gap-3">
      <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={pages.length === 1 ? "The page" : `The ${pages.length} pages`}>
        {pages.map((page, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the pages as added, in order; one taken out re-numbers the rest.
          <li key={i} className="relative shrink-0">
            {page.preview ? (
              <img src={page.preview} alt={`Page ${i + 1}`} className="h-28 w-20 rounded-md bg-bg-subtle object-cover" />
            ) : (
              <span
                role="img"
                aria-label={`Page ${i + 1}: ${page.name}`}
                className="flex h-28 w-20 flex-col items-center justify-center gap-1 rounded-md bg-bg-subtle p-1 text-fg-brand"
              >
                <FileText aria-hidden size={24} />
                <span aria-hidden className="w-full truncate text-center text-[10px] text-fg-normal">
                  {page.name}
                </span>
                <span aria-hidden className="text-[10px] text-fg-subtle">
                  {formatSize(page.size)}
                </span>
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              aria-label={`Take out page ${i + 1}`}
              onClick={() => takeOut(i)}
              className="absolute top-1 right-1 size-7 bg-bg-normal"
            >
              <X aria-hidden size={14} />
            </Button>
          </li>
        ))}
      </ol>
      {status}
      {alert}
      {pages.length < MAX_PAGES && !readying ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="lg:hidden">
            <Pick label="Another page" icon={Camera} camera size="sm" onFiles={(files) => void ready(files)} />
          </span>
          <Pick label="Add a file" icon={FilePlus} size="sm" onFiles={(files) => void ready(files)} />
        </div>
      ) : null}
      {pages.length === 1 && pages[0]!.preview ? (
        <p className="text-xs text-fg-subtle">More than one page? Add each: they're kept together, as one paper.</p>
      ) : null}
      <PaperFields draft={draft} onChange={setDraft} quiet={quiet} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" disabled={!complete(draft) || keeping || readying} loading={keeping}>
          Keep it
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Start again
        </Button>
      </div>
      <p className="text-xs text-fg-subtle">You both see every paper. Expecting keeps it for you; it doesn't read it.</p>
    </form>
  );
}
