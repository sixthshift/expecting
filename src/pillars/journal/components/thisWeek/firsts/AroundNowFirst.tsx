// A first to keep: what it is, its question, and your words for it, kept on
// the day it was. Around now above the story, or once its weeks are past.

import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { firstsSaves } from "../../../../../api/rpc/firsts";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import type { FirstDef } from "../../../../../lib/journal/firsts";
import { type Week, weekLabel } from "../../../../../lib/timeline";
import { DayField } from "../../../features/firsts/components/DayField";

/** A first that's around now: what, its question, and your words for it; kept, it's marked today (or the day you say). */
export function AroundNowFirst({ first, week, onNotYet, past = false }: { first: FirstDef; week: Week; onNotYet?: () => void; past?: boolean }) {
  const { data: people } = usePeopleQuery();
  const mark = useSave(firstsSaves.markFirst);
  const setWords = useSave(firstsSaves.setFirstWords);
  // One that's already happened is written at once, on the day it was.
  const [writing, setWriting] = useState(past);
  const [body, setBody] = useState("");
  const [day, setDay] = useState<ISODate>(todayISO());
  const [choosingDay, setChoosingDay] = useState(past);

  function keep() {
    mark({ key: first.key, day });
    if (body.trim() && people.me) setWords({ key: first.key, body });
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border-brand bg-bg-normal p-4">
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
        <Star aria-hidden size={18} className="text-fg-brand" />
        {first.title}
      </p>
      <p className="text-fg-normal">{first.question}</p>
      {writing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            keep();
          }}
        >
          {people.me ? (
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label={`Your words: ${first.question}`}
              placeholder="In your own words"
              autosize
              rows={2}
              maxLength={10_000}
              autoFocus={!past}
            />
          ) : null}
          {choosingDay ? <DayField value={day} onChange={setDay} /> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" intent="brand" size="sm">
              Keep it
            </Button>
            {choosingDay ? null : (
              <Button type="button" variant="ghost" size="sm" onClick={() => setChoosingDay(true)}>
                It was another day
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button intent="brand" size="sm" onClick={() => setWriting(true)}>
            {people.me ? "Write it" : "Mark it"}
          </Button>
          {onNotYet ? (
            <Button variant="ghost" size="sm" onClick={onNotYet} aria-label={`Not yet: ${first.title}`}>
              Not yet
            </Button>
          ) : null}
        </div>
      )}
      <span className="sr-only">
        Usually {weekLabel(first.weeks[0]).toLowerCase()} to {first.weeks[1]}, around now: week {week}.
      </span>
    </li>
  );
}
