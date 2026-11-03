import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { Switch } from "@sixthshift/design-system/switch";
import { listOf } from "../../../../../../lib/planner/lists/builtIn";
import type { ListSummary } from "../../../../../../lib/planner/lists/summaries";
import { upToSaying } from "../../../../../../lib/planner/lists/summaries";
import { useListPage } from "../../contexts/ListPageContext";
import { listIcon } from "../icons";
import { OwnName } from "./OwnName";

/** Where the list is up to: its icon and name, what it's for, the bar, and for the shop, just what's left. */
export function ListHeading({ summary }: { summary: ListSummary }) {
  const { own, leftOnly, setLeftOnly } = useListPage();
  const Icon = listIcon(summary.id);
  return (
    <header className="flex max-w-3xl flex-col gap-3">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-fg-brand">
          <Icon size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {own ? (
            <OwnName id={own.id} title={own.title} />
          ) : (
            <>
              <h1 className="text-2xl font-display font-semibold text-fg-strong desktop:text-3xl">{summary.title}</h1>
              <p className="max-w-prose text-fg-subtle">{listOf(summary.id)?.about}</p>
            </>
          )}
        </div>
      </div>
      {summary.total > 0 ? (
        <div className="flex max-w-md flex-col gap-1">
          <ProgressBar completed={summary.got} total={summary.total} showFraction={false} label={`${summary.title}: got so far`} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <p className="text-sm text-fg-normal">{upToSaying(summary.id, summary)}</p>
        {summary.got > 0 ? <Switch label="Just what's left" checked={leftOnly} onCheckedChange={setLeftOnly} /> : null}
      </div>
    </header>
  );
}
