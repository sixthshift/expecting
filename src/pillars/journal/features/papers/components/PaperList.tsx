import { useState } from "react";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import type { Paper } from "../../../../../lib/journal/papers";
import { PaperRow } from "./PaperRow";
import { PaperViewer } from "./PaperViewer";

/** Papers as rows, each opened in place. */
export function PaperList({ papers, label }: { papers: Paper[]; label: string }) {
  const { data: settings } = useSettingsQuery();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <ul aria-label={label} className="flex flex-col">
        {papers.map((paper) => (
          <li key={paper.id}>
            <PaperRow paper={paper} dueDate={settings.dueDate} onOpen={() => setOpen(paper.id)} />
          </li>
        ))}
      </ul>
      {open ? <PaperViewer id={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
