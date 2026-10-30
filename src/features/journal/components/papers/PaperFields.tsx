// What a paper is, its name, what it's about, its date, its words and whether
// it's handy: the same fields to keep a new one and to change one. Never what
// it says.

import { Button } from "@sixthshift/design-system/button";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Select } from "@sixthshift/design-system/select";
import { Switch } from "@sixthshift/design-system/switch";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { useNow, useSettings } from "../../../../api/rpc/settings";
import { builtInItems } from "../../../../content";
import { type ISODate, todayISO } from "../../../../lib/dates";
import {
  handyByDefault,
  PAPER_KIND_HINT,
  PAPER_KIND_LABEL,
  PAPER_KINDS,
  PAPER_TITLE_PLACEHOLDER,
  type PaperKind,
  paperTopic,
  paperWeek,
  topicsFor,
} from "../../../../lib/papers";
import type { QuietKind } from "../../../../lib/quiet";
import { weekLabel } from "../../../../lib/timeline";
import { when } from "../notes/notes";

/** A paper as it's being filled in. `titled`: its name was typed, so choosing what it's about leaves it be. `handy` null: as its kind suggests. */
export type PaperDraft = {
  kind: PaperKind | null;
  itemId: string | null;
  title: string;
  titled: boolean;
  day: ISODate;
  /** Whether the date's picker is open, or folded as "Dated today · Change". */
  choosingDay: boolean;
  note: string;
  handy: boolean | null;
};

export function newDraft(today: ISODate = todayISO()): PaperDraft {
  return { kind: null, itemId: null, title: "", titled: false, day: today, choosingDay: false, note: "", handy: null };
}

/** Whether it can be kept: what it is, and a name. */
export function complete(draft: PaperDraft): draft is PaperDraft & { kind: PaperKind } {
  return draft.kind !== null && draft.title.trim().length > 0;
}

/** Whether it's kept handy, as said or as its kind suggests. */
export function handyOf(draft: PaperDraft, quiet: QuietKind | null): boolean {
  return draft.handy ?? handyByDefault(draft.kind, draft.itemId, quiet);
}

/** "Dated today", "Dated Mon 26 Oct". */
export function dated(day: string, today: ISODate = todayISO()): string {
  return day === today ? "Dated today" : `Dated ${when(day, null, today)}`;
}

/** A Library entry's weeks, for putting the ones around a paper's week first. */
function span(id: string) {
  const item = builtInItems.find((i) => i.id === id);
  return item && item.from !== null ? { from: item.from, to: item.to } : null;
}

export function PaperFields({ draft, onChange, quiet }: { draft: PaperDraft; onChange: (draft: PaperDraft) => void; quiet: QuietKind | null }) {
  const { data: settings } = useSettings();
  const now = useNow();
  const today = todayISO();
  const set = (fields: Partial<PaperDraft>) => onChange({ ...draft, ...fields });
  const week = paperWeek(draft.day, settings.dueDate);
  const topics = draft.kind ? topicsFor(draft.kind, { week: week ?? now, quiet, span }) : [];
  // One already chosen stays on offer, even where it wouldn't be suggested now.
  const current = paperTopic(draft.itemId);
  const offered = current && !topics.some((t) => t.id === current.id) ? [current, ...topics] : topics;

  function chooseKind(kind: PaperKind) {
    const keeps = paperTopic(draft.itemId)?.kind === kind;
    set({ kind, itemId: keeps ? draft.itemId : null, title: keeps || draft.titled ? draft.title : "" });
  }

  function chooseTopic(id: string | null) {
    const topic = paperTopic(id);
    set({ itemId: topic?.id ?? null, title: draft.titled ? draft.title : (topic?.title ?? "") });
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <p id="paper-kind" className="text-sm font-medium text-fg-strong">
          What is it?
        </p>
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="outline"
          intent="brand"
          aria-labelledby="paper-kind"
          className="flex-wrap"
          value={draft.kind ?? ""}
          onValueChange={(value) => (value ? chooseKind(value as PaperKind) : null)}
          options={PAPER_KINDS.map((k) => ({ value: k, label: PAPER_KIND_LABEL[k] }))}
        />
        {draft.kind ? <p className="text-xs text-fg-subtle">{PAPER_KIND_HINT[draft.kind]}</p> : null}
      </div>
      {offered.length > 0 ? (
        <FormField label="What it's about" description="Links it to its page in the Library. None of these is fine too.">
          <Select
            aria-label="What it's about"
            searchable
            clearable
            placeholder="None of these"
            options={offered.map((t) => ({ value: t.id, label: t.title }))}
            value={draft.itemId ?? undefined}
            onValueChange={(value) => chooseTopic(value || null)}
          />
        </FormField>
      ) : null}
      <FormField label="Its name">
        <Input
          value={draft.title}
          onChange={(e) => set({ title: e.target.value, titled: e.target.value.trim().length > 0 })}
          placeholder={draft.kind ? PAPER_TITLE_PLACEHOLDER[draft.kind] : "What it says at the top"}
          aria-label="Its name"
          maxLength={200}
        />
      </FormField>
      {draft.choosingDay ? (
        <FormField label="The date on it">
          <DatePicker
            value={draft.day}
            onChange={(d) => set({ day: (d as ISODate | undefined) ?? draft.day })}
            segmentOrder="dmy"
            weekStartsOn={1}
            clearable={false}
            maxDate={today}
          />
        </FormField>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => set({ choosingDay: true })}>
          {[dated(draft.day, today), week !== null ? weekLabel(week) : null].filter(Boolean).join(" · ")} · Change
        </Button>
      )}
      <Input
        value={draft.note}
        onChange={(e) => set({ note: e.target.value })}
        placeholder="The midwife kept the original"
        aria-label="Anything to remember, if you want"
        maxLength={2_000}
      />
      <div className="flex flex-col gap-1">
        <Switch label="Keep handy" checked={handyOf(draft, quiet)} onCheckedChange={(on) => set({ handy: on })} />
        <p className="text-xs text-fg-subtle">On top here and on Emergency info, and kept on each phone for when there's no signal.</p>
      </div>
    </>
  );
}
