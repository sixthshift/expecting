import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Star } from "lucide-react";
import { useState } from "react";
import { firstsSaves, useFirsts } from "../../../../../api/rpc/firsts";
import { useSave } from "../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../lib/dates";
import { firstOf, isMarked, type Suggestion } from "../../../../../lib/firsts";
import { dayOf } from "../../../model/dates";
import { DayField } from "../../entries/firsts/DayField";
import { FirstWords } from "../../entries/firsts/FirstWords";

/**
 * A first suggested by what's kept: was this it? Yes marks it on that day,
 * Another day lets you say when, Not this puts it aside for good. Once
 * marked, its question.
 */
export function SuggestedFirst({ suggestion }: { suggestion: Suggestion }) {
  const { data: firsts } = useFirsts();
  const mark = useSave(firstsSaves.markFirst);
  const aside = useSave(firstsSaves.setFirstAside);
  const [choosing, setChoosing] = useState(false);
  const [day, setDay] = useState<ISODate>(suggestion.day);
  const [done, setDone] = useState(false);
  const kept = firsts.find((f) => f.key === suggestion.key);
  const { title } = firstOf(suggestion.key);

  if (done) return null;
  if (kept && isMarked(kept)) {
    return (
      <Card size="sm" className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg-strong">
          <Star aria-hidden size={16} className="fill-current text-fg-brand" /> {title}, {dayOf(kept.day)}
        </p>
        <FirstWords mark={kept} onDone={() => setDone(true)} />
      </Card>
    );
  }
  return (
    <Card size="sm" className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">
        {suggestion.why}, {dayOf(suggestion.day)}.
      </p>
      <p className="flex items-center gap-2 font-medium text-fg-strong">
        <Star aria-hidden size={16} className="text-fg-brand" /> {title}?
      </p>
      {choosing ? <DayField value={day} onChange={setDay} /> : null}
      <div className="flex flex-wrap gap-2">
        <Button intent="brand" size="sm" onClick={() => mark({ key: suggestion.key, day })}>
          {choosing ? "Mark it" : "Yes, mark it"}
        </Button>
        {choosing ? null : (
          <Button variant="outline" size="sm" onClick={() => setChoosing(true)}>
            Another day
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => aside({ key: suggestion.key })}>
          Not this
        </Button>
      </div>
    </Card>
  );
}
