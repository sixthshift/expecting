import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Input } from "@sixthshift/design-system/input";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { Switch } from "@sixthshift/design-system/switch";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { listsSaves, useLists } from "../../../api/rpc/lists";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import { useSave } from "../../../app/hooks/useSave";
import type { Line } from "../../../content/schema";
import { isApart, isLeft, type ListSummary, listOf, listsOf, type Mark, sectionsOf, upToSaying } from "../../../lib/lists";
import { weekLabel } from "../../../lib/timeline";
import { useTasks } from "../../tasks/hooks/useTasks";
import { AddLine } from "../components/addLine/AddLine";
import { listIcon, sectionIcon } from "../components/icons";
import { LineRow, type LineTask } from "../components/line/LineRow";
import { useLines } from "../hooks/useLines";

const route = getRouteApi("/app/planner/lists/$listId");

/** How close a task's best-by week is before its badge turns to a warning. */
const SOON = 2;

/**
 * One list: where it's up to, then its sections as cards (flowing down two
 * columns on a desktop), each line with its tick, what's left first. "Just what's left"
 * hides the got, for the shop. Your own lines are added at the foot, the
 * not-needed folded under them. A list of your own can be renamed or
 * deleted. A list that isn't here (deleted on the other phone, or a built-in
 * one with nothing on it for you) says so.
 */
export function ListPage() {
  const { listId } = route.useParams();
  const lines = useLines();
  const { data: lists } = useLists();
  const { data: quiet } = useQuiet();
  const { data: people } = usePeople();
  const { data: checklist } = useChecklist();
  const tasks = useTasks();
  const now = useNow();
  // Ticked during this visit: they keep their place until the next one.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const [leftOnly, setLeftOnly] = useState(false);
  const summary = listsOf(lines, lists.ownLists, lists.marks).find((l) => l.id === listId);
  const own = lists.ownLists.find((l) => l.id === listId);

  const by = (id: string | null) => (id === null ? null : id === people.me?.id ? "you" : (people.people.find((p) => p.id === id)?.name ?? null));
  const taskOf = (line: Line): LineTask | null => {
    const task = line.taskId ? tasks.find((t) => t.id === line.taskId) : undefined;
    if (!task) return null;
    if (checklist.ticks[task.id]) return { label: "done in To do", soon: false, done: true };
    return { label: `by ${weekLabel(task.due).toLowerCase()}`, soon: now !== null && task.due - now <= SOON, done: false };
  };
  const row = (line: Line) => {
    const mark = lists.marks[line.id];
    return (
      <LineRow
        key={line.id}
        line={line}
        mark={mark}
        by={by(mark?.by ?? null)}
        task={taskOf(line)}
        onTick={(got) => got && setTickedHere((ids) => new Set(ids).add(line.id))}
      />
    );
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex flex-col gap-6">
        {/* The bag is It's time's: back is there. */}
        <Link
          to={isApart(listId) ? "/its-time" : "/planner/lists"}
          className="-ml-2 -mb-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal"
        >
          <ArrowLeft aria-hidden size={16} /> {isApart(listId) ? "It's time" : "Lists"}
        </Link>
        {quiet ? (
          <p className="max-w-prose text-sm text-fg-subtle">The lists are put away while Expecting is quiet. Nothing is deleted.</p>
        ) : !summary ? (
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-display font-semibold text-fg-strong">Not here</h1>
            <p className="text-fg-subtle">This list isn't here any more. It may have been deleted on the other phone.</p>
          </div>
        ) : (
          <>
            <Heading summary={summary} own={own ? { id: own.id, title: own.title } : null} leftOnly={leftOnly} onLeftOnly={setLeftOnly} />
            <Sections listId={listId} lines={lines} marks={lists.marks} stay={tickedHere} leftOnly={leftOnly} row={row} />
            <AddLine listId={listId} />
          </>
        )}
      </div>
    </main>
  );
}

/** Where the list is up to: its icon and name, what it's for, the bar, and for the shop, just what's left. */
function Heading({
  summary,
  own,
  leftOnly,
  onLeftOnly,
}: {
  summary: ListSummary;
  own: { id: string; title: string } | null;
  leftOnly: boolean;
  onLeftOnly: (on: boolean) => void;
}) {
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
              <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{summary.title}</h1>
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
        {summary.got > 0 ? <Switch label="Just what's left" checked={leftOnly} onCheckedChange={onLeftOnly} /> : null}
      </div>
    </header>
  );
}

function Sections({
  listId,
  lines,
  marks,
  stay,
  leftOnly,
  row,
}: {
  listId: string;
  lines: Line[];
  marks: Readonly<Record<string, Mark>>;
  stay: ReadonlySet<string>;
  leftOnly: boolean;
  row: (line: Line) => ReactNode;
}) {
  const [showNotNeeded, setShowNotNeeded] = useState(false);
  const { sections, notNeeded } = sectionsOf(listId, lines, marks, stay);
  const shown = sections
    .map((s) => ({ ...s, lines: leftOnly ? s.lines.filter((l) => isLeft(marks[l.id]) || stay.has(l.id)) : s.lines }))
    .filter((s) => s.lines.length > 0);
  return (
    <div className="flex flex-col gap-4">
      {leftOnly && shown.length === 0 ? <p className="text-fg-normal">All sorted: nothing left to get on this list.</p> : null}
      {shown.length > 0 ? (
        <div className="gap-4 lg:columns-2">
          {shown.map((section) => {
            const Icon = sectionIcon(listId, section.key);
            const total = sections.find((s) => s.key === section.key)?.lines.length ?? section.lines.length;
            return (
              <Card key={section.key ?? "yours"} size="md" className="mb-4 flex break-inside-avoid flex-col">
                <section aria-label={section.title ?? undefined} className="flex flex-col">
                  {section.title ? (
                    <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-fg-strong">
                      {Icon ? <Icon aria-hidden size={16} className="text-fg-brand" /> : null}
                      <span className="flex-1">{section.title}</span>
                      <span className="text-xs font-normal text-fg-subtle">
                        {section.got} of {total}
                      </span>
                    </h2>
                  ) : null}
                  {section.lines.map(row)}
                </section>
              </Card>
            );
          })}
        </div>
      ) : null}
      {notNeeded.length > 0 && !leftOnly ? (
        <section className="flex flex-col">
          <button
            type="button"
            aria-expanded={showNotNeeded}
            onClick={() => setShowNotNeeded((s) => !s)}
            className="flex min-h-11 w-fit items-center gap-1 text-sm font-semibold text-fg-subtle hover:text-fg-normal"
          >
            {showNotNeeded ? <ChevronDown aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />}
            Not needed ({notNeeded.length})
          </button>
          {showNotNeeded ? <Card size="md">{notNeeded.map(row)}</Card> : null}
        </section>
      ) : null}
    </div>
  );
}

/** A list of your own's name, renamed in place, and deleted after asking: its lines go with it. */
function OwnName({ id, title }: { id: string; title: string }) {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(title);
  const rename = useSave(listsSaves.renameList);
  const remove = useSave(listsSaves.deleteList);
  const navigate = useNavigate();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length > 0 && name.trim() !== title) rename({ id, title: name });
    setRenaming(false);
  }

  function deleteIt() {
    remove({ id });
    navigate({ to: "/planner/lists" });
  }

  return (
    <div className="flex flex-col gap-1">
      {renaming ? (
        <form onSubmit={submit} className="flex max-w-xl gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="The list's name" maxLength={200} className="flex-1" autoFocus />
          <Button type="submit" intent="brand" size="sm">
            Save
          </Button>
        </form>
      ) : (
        <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{title}</h1>
      )}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-fg-normal">Delete this list and everything on it, from both phones?</span>
          <Button intent="danger" size="sm" onClick={deleteIt}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      ) : renaming ? null : (
        <div className="-ml-3 flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setRenaming(true)}>
            Rename
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Delete list
          </Button>
        </div>
      )}
    </div>
  );
}
