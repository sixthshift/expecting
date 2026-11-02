// A paper's photographed page, as big as the screen allows.

import { Download } from "lucide-react";
import { isOnPhone } from "../../../../../../app/model/uploads";
import { fileUrl } from "../../../../../../lib/files";
import type { PaperPage } from "../../../../../../lib/journal/papers";
import { Picture } from "../../../photos/components/Picture";

/** A photographed page, as big as the screen allows, with its original to download. */
export function PicturePage({ page, alt, label }: { page: PaperPage; alt: string; label: string }) {
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
