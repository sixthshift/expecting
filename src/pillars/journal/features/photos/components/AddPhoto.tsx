// A photo or scan: take it or choose it, say what it is, and keep it. On a
// phone the camera is one tap (the rear one, straight away) and the phone's
// own picker is beside it; on a desktop a drop target. It's made ready on the
// phone (src/app/model/uploads.ts), kept there, and goes up with its save,
// so one taken in a hospital car park with no signal is never lost.

import { Button } from "@sixthshift/design-system/button";
import { FileDropzone } from "@sixthshift/design-system/file-dropzone";
import { Input } from "@sixthshift/design-system/input";
import { Modal } from "@sixthshift/design-system/modal";
import { Spinner } from "@sixthshift/design-system/spinner";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Camera, Images } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { photosSaves } from "../../../../../api/rpc/photos";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import { useLayout } from "../../../../../app/hooks/useLayout";
import { useSave } from "../../../../../app/hooks/useSave";
import { FileProblemError, keepOnPhone, type Prepared, prepareFile, previewUrl } from "../../../../../app/model/uploads";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { FILE_PROBLEM, type FileProblem, isImage, MAX_ORIGINAL } from "../../../../../lib/files";
import { PHOTO_KIND_LABEL, PHOTO_KINDS, type PhotoKind, takenOn } from "../../../../../lib/journal/photos";
import { when } from "../../../../../lib/labels";
import { newId } from "../../../../../lib/outbox";
import { placeOf, weekLabel } from "../../../../../lib/timeline";
import { Pick } from "../../../components/Pick";
import { WhenFields } from "../../../components/WhenFields";

/** A picture made ready, with its preview while it's on screen here. */
type Shot = Prepared & { preview: string | null };

/** What to suggest writing, by what it is. */
const PLACEHOLDER: Record<PhotoKind, string> = {
  bump: "28 weeks, and the hiccups started",
  scan: "12-week scan, measuring 6.1 cm",
  other: "The first outfit",
};

/** Where a day falls, in words: "Week 28", or nothing without a due date or outside the pregnancy. */
function weekOf(day: ISODate, dueDate: ISODate | null): string | null {
  if (!dueDate) return null;
  const place = placeOf(day, dueDate);
  return typeof place === "number" ? weekLabel(place) : null;
}

/**
 * Take or choose a photo (or several), then what it is, when, and a few
 * words. `kind` sets what it is (the bump row's empty frame is a bump);
 * `kinds` is what it can be (never a bump after a loss). `files`: already
 * chosen (shared from another app). `onAdded` once kept (the capture sheet closes).
 */
export function AddPhoto({
  kind: preset,
  kinds = PHOTO_KINDS,
  files: given,
  onAdded,
}: {
  kind?: PhotoKind;
  kinds?: readonly PhotoKind[];
  files?: File[];
  onAdded?: (id: string) => void;
}) {
  const add = useSave(photosSaves.addPhoto);
  const layout = useLayout();
  const { data: settings } = useSettingsQuery();
  const [shots, setShots] = useState<Shot[]>([]);
  const [readying, setReadying] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [kind, setKind] = useState<PhotoKind | null>(preset ?? null);
  const [caption, setCaption] = useState("");
  // Each picture keeps its own day (its camera's, else now) unless one is chosen for them all.
  const [choosing, setChoosing] = useState(false);
  const [day, setDay] = useState<ISODate | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [keeping, setKeeping] = useState(false);
  const today = todayISO();

  // The previews are this form's own; let them go with it.
  useEffect(
    () => () => {
      for (const shot of shots) if (shot.preview) URL.revokeObjectURL(shot.preview);
    },
    [shots]
  );

  function reset() {
    setShots([]);
    setProblem(null);
    setKind(preset ?? null);
    setCaption("");
    setChoosing(false);
    setDay(null);
    setTime(null);
  }

  async function ready(files: File[]) {
    if (files.length === 0) return;
    setReadying(true);
    setProblem(null);
    const made: Shot[] = [];
    const problems: FileProblem[] = [];
    for (const file of files) {
      try {
        const prepared = await prepareFile(file);
        if (isImage(prepared.type)) made.push({ ...prepared, preview: previewUrl(prepared) });
        else problems.push("type");
      } catch (error) {
        problems.push(error instanceof FileProblemError ? error.problem : "unreadable");
      }
    }
    setShots(made);
    setReadying(false);
    const first = problems[0];
    if (first) setProblem(made.length > 0 ? `${FILE_PROBLEM[first]} The rest are ready.` : FILE_PROBLEM[first]);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: the files given are made ready once, as the form opens.
  useEffect(() => {
    if (given) void ready(given);
  }, []);

  async function keep(event: FormEvent) {
    event.preventDefault();
    if (!kind || shots.length === 0 || keeping) return;
    setKeeping(true);
    let first: string | null = null;
    try {
      for (const shot of shots) {
        const fileId = newId();
        // On the phone first: the save that sends it may wait a long time for a connection.
        await keepOnPhone(fileId, shot);
        const at = choosing ? { day: day ?? today, time } : takenOn(shot.takenAt);
        const id = newId();
        first ??= id;
        add({ id, fileId, kind, day: at.day, time: at.time, caption: caption.trim() || null });
      }
    } finally {
      setKeeping(false);
    }
    reset();
    if (first) onAdded?.(first);
  }

  if (shots.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {readying ? (
          <p className="flex min-h-12 items-center gap-2 text-sm text-fg-subtle" role="status">
            <Spinner size="sm" /> Getting it ready…
          </p>
        ) : layout === "mobile" ? (
          // A phone: the camera, one tap, and the phone's own picker beside it.
          <div className="grid grid-cols-2 gap-2">
            <Pick label="Take a photo" icon={Camera} camera primary onFiles={(files) => void ready(files)} />
            <Pick label="Choose photos" icon={Images} onFiles={(files) => void ready(files)} />
          </div>
        ) : (
          // A desktop: drop them in, or choose.
          <FileDropzone
            size="sm"
            accept="image/*"
            multiple
            maxSize={MAX_ORIGINAL}
            label="Drop photos here, or choose them"
            hint="Bump photos, scans, anything worth keeping. JPEG, PNG or HEIC, up to 30 MB."
            onFilesChange={(files) => void ready(files)}
            onFilesRejected={(rejected) => setProblem(FILE_PROBLEM[rejected[0]?.reason === "size" ? "big" : "type"])}
          />
        )}
        {problem ? (
          <p role="alert" className="text-sm text-fg-danger">
            {problem}
          </p>
        ) : null}
      </div>
    );
  }

  const first = takenOn(shots[0]!.takenAt);
  const shownDay = choosing ? (day ?? today) : first.day;
  const week = weekOf(shownDay, settings.dueDate);
  const shownWhen = when(shownDay, choosing ? time : first.time);

  return (
    <form onSubmit={keep} className="flex flex-col gap-3">
      <ul className="flex gap-2 overflow-x-auto pb-1" aria-label={shots.length === 1 ? "The photo" : `The ${shots.length} photos`}>
        {shots.map((shot, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the pictures as chosen, in order, never reordered.
          <li key={i} className="shrink-0">
            {shot.preview ? <img src={shot.preview} alt="" className="size-24 rounded-md bg-bg-subtle object-cover" /> : null}
          </li>
        ))}
      </ul>
      {problem ? <p className="text-sm text-fg-normal">{problem}</p> : null}
      {preset ? null : (
        <div className="flex flex-col gap-1">
          <p id="photo-kind" className="text-sm font-medium text-fg-strong">
            What is it?
          </p>
          <ToggleGroup
            type="single"
            appearance="separate"
            variant="outline"
            intent="brand"
            aria-labelledby="photo-kind"
            className="flex-wrap"
            value={kind ?? ""}
            onValueChange={(value) => setKind(value as PhotoKind)}
            options={kinds.map((k) => ({ value: k, label: PHOTO_KIND_LABEL[k] }))}
          />
        </div>
      )}
      {choosing ? (
        <WhenFields day={day ?? today} time={time} onDay={setDay} onTime={setTime} timeLabel="Time (if it matters)" />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            setDay(first.day);
            setTime(first.time);
            setChoosing(true);
          }}
        >
          {[first.fromPhoto ? `Taken ${shownWhen.replace(/^Today/, "today")}` : shownWhen, week].filter(Boolean).join(" · ")} · Change
        </Button>
      )}
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={kind ? PLACEHOLDER[kind] : "A few words, if you want"}
        aria-label="A few words, if you want"
        maxLength={2_000}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" disabled={!kind || keeping} loading={keeping}>
          {shots.length === 1 ? "Keep it" : `Keep all ${shots.length}`}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Choose again
        </Button>
      </div>
      <p className="text-xs text-fg-subtle">You both see every photo.</p>
    </form>
  );
}

/** `AddPhoto` on its own, over the page, under `title`; it closes once the photo is kept. */
export function AddPhotoModal({ title, kind, kinds, onClose }: { title: string; kind?: PhotoKind; kinds?: readonly PhotoKind[]; onClose: () => void }) {
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        <AddPhoto kind={kind} kinds={kinds} onAdded={onClose} />
      </Modal.Body>
    </Modal>
  );
}
