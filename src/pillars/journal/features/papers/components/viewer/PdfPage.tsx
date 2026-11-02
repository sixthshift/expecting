// A paper's PDF page, as a tile that opens in the phone's own viewer.

import { Button } from "@sixthshift/design-system/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useUploadSrc } from "../../../../../../app/hooks/useUploadSrc";
import { isOnPhone } from "../../../../../../app/model/uploads";
import { fileUrl, formatSize } from "../../../../../../lib/files";
import type { PaperPage } from "../../../../../../lib/journal/papers";

/** A PDF page: its name and size, opened in a new tab (the phone's own viewer) or downloaded. */
export function PdfPage({ page, label }: { page: PaperPage; label: string }) {
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
