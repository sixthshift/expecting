// A day's photos, large.

import { cn } from "@sixthshift/design-system/utils";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import type { Photo } from "../../../../lib/photos";
import { describePhoto } from "../../model/labels";
import { Picture } from "../entries/photos/Picture";

/** Photos, large: one across the page, several two to a row, each with its words. */
export function PhotoThumbs({ photos, onOpen }: { photos: readonly Photo[]; onOpen: (id: string) => void }) {
  const { data: settings } = useSettingsQuery();
  return (
    <ul className={cn("grid gap-2", photos.length > 1 && "grid-cols-2")}>
      {photos.map((photo) => (
        <li key={photo.id} className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpen(photo.id)}
            className="relative block w-full overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Picture
              fileId={photo.fileId}
              variant={photos.length > 1 ? "thumb" : "display"}
              alt={describePhoto(photo, settings.dueDate)}
              className={cn("w-full object-cover", photos.length > 1 ? "aspect-square" : "aspect-4/3 max-h-112")}
            />
            {photo.kind === "scan" ? (
              <span aria-hidden className="absolute bottom-2 left-2 rounded-full bg-bg-normal px-2 text-xs text-fg-normal">
                Scan
              </span>
            ) : null}
          </button>
          {photo.caption ? <p className="text-fg-normal">{photo.caption}</p> : null}
        </li>
      ))}
    </ul>
  );
}
