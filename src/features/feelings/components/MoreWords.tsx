import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { useState } from "react";
import { usePeopleQuery } from "../../../api/rpc/people";
import { type OwnFeeling, WORDS, type Word } from "../../../lib/feelings";

const OPTIONS = WORDS.map((word) => ({ value: word, label: word }));

/** After the step, if you want: words to pick and a box to say more. Only yours; kept when you're done. */
export function MoreWords({ feeling, onDone }: { feeling: OwnFeeling; onDone: (more: { words: Word[]; note: string | null }) => void }) {
  const [words, setWords] = useState<Word[]>(feeling.words);
  const [note, setNote] = useState(feeling.note ?? "");
  const { data: people } = usePeopleQuery();
  const other = people.people.find((p) => p.id !== people.me?.id);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onDone({ words, note: note.trim() || null });
      }}
    >
      <ToggleGroup
        type="multiple"
        appearance="separate"
        size="xs"
        variant="outline"
        intent="brand"
        aria-label="Any words for it?"
        className="flex-wrap"
        value={words}
        onValueChange={(value) => setWords(value as Word[])}
        options={OPTIONS}
      />
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Say more, if you want…"
        aria-label="Say more"
        autosize
        rows={2}
        maxLength={10_000}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button type="submit" intent="brand" size="sm">
          Done
        </Button>
        <p className="text-xs text-fg-subtle">{other ? `${other.name} sees how you are, not these words.` : "Only you see these words."}</p>
      </div>
    </form>
  );
}
