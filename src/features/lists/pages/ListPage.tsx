import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { listsSaves, useLists } from "../../../api/rpc/lists";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { useSave } from "../../../app/hooks/useSave";
import type { Line } from "../../../content/schema";
import { leftSaying, listOf, listsOf, sectionsOf } from "../../../lib/lists";
import { weekLabel } from "../../../lib/timeline";
import { useTasks } from "../../tasks/hooks/useTasks";
import { AddLine } from "../components/addLine/AddLine";
import { LineRow, type LineTask } from "../components/line/LineRow";
import { useLines } from "../hooks/useLines";

const route = getRouteApi("/app/planner/lists/$listId");

/**
 * One list: its lines by its sections, each with its tick, your own added at
 * the foot, and the not-needed folded away under them. A list of your own can
 * be renamed or deleted. A list that isn't here (deleted on the other phone,
 * or a built-in one with nothing on it for you) says so.
 */
export function ListPage() {
  const { listId } = route.useParams();
  const lines = useLines();
  const { data: lists } = useLists();
  const { data: quiet } = useQuiet();
  const { data: people } = usePeople();
  const { data: checklist } = useChecklist();
  const tasks = useTasks();
  const summary = listsOf(lines, lists.ownLists, lists.marks).find((l) => l.id === listId);
  const own = lists.ownLists.find((l) => l.id === listId);

  const by = (id: string | null) => (id === null ? null : id === people.me?.id ? "you" : (people.people.find((p) => p.id === id)?.name ?? null));
  const taskOf = (line: Line): LineTask | null => {
    const task = line.taskId ? tasks.find((t) => t.id === line.taskId) : undefined;
    if (!task) return null;
    return { label: checklist.ticks[task.id] ? "done in To do" : `by ${weekLabel(task.due).toLowerCase()} · in To do` };
  };
  const row = (line: Line) => {
    const mark = lists.marks[line.id];
    return <LineRow key={line.id} line={line} mark={mark} by={by(mark?.by ?? null)} task={taskOf(line)} />;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <div className="flex max-w-3xl flex-col gap-6">
        <Link to="/planner/lists" className="-ml-2 -mb-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
          <ArrowLeft aria-hidden size={16} /> Lists
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
            {own ? (
              <OwnHeading id={own.id} title={own.title} left={leftSaying(listId, summary)} />
            ) : (
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{summary.title}</h1>
                <p className="max-w-prose text-fg-subtle">
                  {listOf(listId)?.about} {leftSaying(listId, summary)}.
                </p>
              </div>
            )}
            <Sections listId={listId} lines={lines} marks={lists.marks} row={row} />
            <AddLine listId={listId} />
          </>
        )}
      </div>
    </main>
  );
}

function Sections({ listId, lines, marks, row }: { listId: string; lines: Line[]; marks: Parameters<typeof sectionsOf>[2]; row: (line: Line) => ReactNode }) {
  const [showNotNeeded, setShowNotNeeded] = useState(false);
  const { sections, notNeeded } = sectionsOf(listId, lines, marks);
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section key={section.key ?? "loose"} aria-label={section.title ?? undefined} className="flex flex-col">
          {section.title ? <h2 className="mb-1 text-sm font-semibold text-fg-normal">{section.title}</h2> : null}
          {section.lines.map(row)}
        </section>
      ))}
      {notNeeded.length > 0 ? (
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
          {showNotNeeded ? notNeeded.map(row) : null}
        </section>
      ) : null}
    </div>
  );
}

/** A list of your own's name, renamed in place, and deleted after asking: its lines go with it. */
function OwnHeading({ id, title, left }: { id: string; title: string; left: string }) {
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
    <div className="flex flex-col gap-2">
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
      <p className="text-fg-subtle">{left}.</p>
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
