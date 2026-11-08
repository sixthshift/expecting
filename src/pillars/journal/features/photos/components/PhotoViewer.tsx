// One photo, opened: as big as the screen allows, what it is and when, its
// words, the ones beside it, and changing, downloading or deleting it. And
// the bump side by side: two weeks next to each other, the point of taking
// one a week.

import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { toast } from "@sixthshift/design-system/overlay";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { photosSaves, usePhotosQuery } from "../../../../../api/rpc/photos";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import { useSave } from "../../../../../app/hooks/useSave";
import { isOnPhone } from "../../../../../app/model/uploads";
import { TitledModal } from "../../../../../components/TitledModal";
import type { ISODate } from "../../../../../lib/dates";
import { fileUrl } from "../../../../../lib/files";
import { PHOTO_KIND_LABEL, type Photo, type PhotoKind } from "../../../../../lib/journal/photos";
import { when } from "../../../../../lib/labels";
import { nameBy } from "../../../../../lib/people";
import { placeOf, weekLabel } from "../../../../../lib/timeline";
import { forgetFile } from "../../../../../pwa/register";
import { ChangeOrDelete } from "../../../components/ChangeOrDelete";
import { WhenFields } from "../../../components/WhenFields";
import { changedBy, describePhoto, keptBy, photoTitle } from "../../../model/labels";
import { Picture } from "./Picture";

/** Change what it is, when, and its words; never the picture. */
function ChangePhoto({ photo, kinds, onDone }: { photo: Photo; kinds: readonly PhotoKind[]; onDone: () => void }) {
  const edit = useSave(photosSaves.editPhoto);
  const [kind, setKind] = useState<PhotoKind>(photo.kind);
  const [day, setDay] = useState<ISODate>(photo.day as ISODate);
  const [time, setTime] = useState<string | null>(photo.time);
  const [caption, setCaption] = useState(photo.caption ?? "");
  // A bump kept before a loss stays a bump; it just isn't offered for new ones.
  const offered = kinds.includes(photo.kind) ? kinds : [photo.kind, ...kinds];

  function submit(event: FormEvent) {
    event.preventDefault();
    edit({ id: photo.id, kind, day, time, caption: caption.trim() || null });
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        appearance="separate"
        variant="outline"
        intent="brand"
        aria-label="What is it?"
        className="flex-wrap"
        value={kind}
        onValueChange={(value) => setKind(value as PhotoKind)}
        options={offered.map((k) => ({ value: k, label: PHOTO_KIND_LABEL[k] }))}
      />
      <WhenFields day={day} time={time} onDay={setDay} onTime={setTime} timeLabel="Time (if it matters)" />
      <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="A few words, if you want" aria-label="Its words" maxLength={2_000} />
      <div className="flex gap-2">
        <Button type="submit" intent="brand" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/**
 * One photo, opened from `ids` at `index`, with Previous and Next among them.
 * Read from the photos as they are now, so one the other phone deletes closes.
 * Deleting asks first: the picture goes from both phones, with nothing to put back.
 */
export function PhotoViewer({ ids, index: start, kinds, onClose }: { ids: string[]; index: number; kinds: readonly PhotoKind[]; onClose: () => void }) {
  const { data: photos } = usePhotosQuery();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const remove = useSave(photosSaves.deletePhoto);
  const [index, setIndex] = useState(start);
  const [changing, setChanging] = useState(false);
  const here = ids.filter((id) => photos.some((p) => p.id === id));
  const at = Math.min(index, here.length - 1);
  const photo = photos.find((p) => p.id === here[at]);
  const name = (id: string | null) => nameBy(id, people.me, people.people);

  // Deleted, here or on the other phone: nothing left to show.
  useEffect(() => {
    if (!photo) onClose();
  }, [photo, onClose]);
  if (!photo) return null;

  const place = settings.dueDate ? placeOf(photo.day as ISODate, settings.dueDate) : null;
  const title = [photoTitle(photo.kind), typeof place === "number" ? weekLabel(place) : null].filter(Boolean).join(" · ");

  function go(step: number) {
    setIndex((i) => (i + step + here.length) % here.length);
    setChanging(false);
  }

  function deleteIt(target: Photo) {
    remove({ id: target.id });
    void forgetFile(target.fileId);
    toast({ title: "Photo deleted" });
    onClose();
  }

  return (
    <TitledModal title={title} size="lg" onClose={onClose} className="flex flex-col gap-3">
      <Picture
        fileId={photo.fileId}
        variant="display"
        alt={describePhoto(photo, settings.dueDate)}
        className="max-h-[60vh] w-full rounded-md bg-bg-subtle object-contain"
      />
      {here.length > 1 ? (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => go(-1)}>
            <ChevronLeft aria-hidden size={16} /> Previous
          </Button>
          <span className="text-xs text-fg-subtle">
            {at + 1} of {here.length}
          </span>
          <Button variant="ghost" size="sm" onClick={() => go(1)}>
            Next <ChevronRight aria-hidden size={16} />
          </Button>
        </div>
      ) : null}
      {changing ? (
        <ChangePhoto photo={photo} kinds={kinds} onDone={() => setChanging(false)} />
      ) : (
        <>
          {photo.caption ? <p className="whitespace-pre-wrap text-fg-normal">{photo.caption}</p> : null}
          <p className="text-xs text-fg-subtle">
            {[keptBy(name(photo.by)), when(photo.day, photo.time), changedBy(photo, people.me, people.people)].filter(Boolean).join(" · ")}
          </p>
          {isOnPhone(photo.fileId) ? <p className="text-xs text-fg-subtle">Still on this phone: it goes up as soon as it can.</p> : null}
          <ChangeOrDelete
            key={photo.id}
            asks="Delete this photo? It goes from both phones, and can't be put back."
            onChange={() => setChanging(true)}
            onDelete={() => deleteIt(photo)}
          >
            {isOnPhone(photo.fileId) ? null : (
              <Button asChild variant="ghost" size="sm">
                <a href={fileUrl(photo.fileId, "original", { download: true })} download>
                  <Download aria-hidden size={16} /> Download the original
                </a>
              </Button>
            )}
          </ChangeOrDelete>
        </>
      )}
    </TitledModal>
  );
}
