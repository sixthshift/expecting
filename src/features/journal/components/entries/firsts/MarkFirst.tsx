import { Button } from "@sixthshift/design-system/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { firstsSaves, useFirsts } from "../../../../../api/rpc/firsts";
import { settingsSaves, useSettings } from "../../../../../api/rpc/settings";
import { useSave } from "../../../../../app/hooks/useSave";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { type FirstKey, firstOf, firstsOffered, isMarked } from "../../../../../lib/firsts";
import { BABY, type Baby } from "../../../../../lib/theme";
import { DayField } from "./DayField";
import { FirstWords } from "./FirstWords";

/**
 * Mark a first: which (those not yet marked, in their order), when (today
 * unless changed), then its question. `first`: start at that one (a task
 * that keeps it). Boy or girl marked while Expecting doesn't know asks
 * whether to use it, as some know and keep it out of the app. `onAdded` once
 * done, with its key.
 */
export function MarkFirst({ first, onAdded }: { first?: FirstKey; onAdded?: (key: FirstKey) => void }) {
  const { data: firsts } = useFirsts();
  const { data: settings } = useSettings();
  const mark = useSave(firstsSaves.markFirst);
  const saveSettings = useSave(settingsSaves.saveSettings);
  const [chosen, setChosen] = useState<FirstKey | null>(first ?? null);
  const [asking, setAsking] = useState(false);
  const [day, setDay] = useState<ISODate>(todayISO());
  const [marked, setMarked] = useState<FirstKey | null>(null);
  const kept = firsts.find((f) => f.key === marked);
  const left = firstsOffered(settings.baby !== "unknown").filter((f) => !firsts.some((m) => m.key === f.key && isMarked(m)));

  if (asking) {
    const use = (baby?: Baby) => {
      if (baby) saveSettings({ baby });
      setAsking(false);
    };
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-normal">Should Expecting use it? It would know from here on, and its colours change to match.</p>
        <div className="flex flex-wrap gap-2">
          <Button intent="brand" onClick={() => use("boy")}>
            {BABY.boy}
          </Button>
          <Button intent="brand" onClick={() => use("girl")}>
            {BABY.girl}
          </Button>
          <Button variant="ghost" onClick={() => use()}>
            Keep it out of the app
          </Button>
        </div>
      </div>
    );
  }

  if (kept && isMarked(kept)) return <FirstWords mark={kept} onDone={() => onAdded?.(kept.key)} />;

  if (chosen) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          mark({ key: chosen, day });
          setMarked(chosen);
          if (chosen === "boy-or-girl" && settings.baby === "unknown") setAsking(true);
        }}
      >
        <p className="font-medium text-fg-strong">{firstOf(chosen).title}</p>
        <DayField value={day} onChange={setDay} />
        <div className="flex gap-2">
          <Button type="submit" intent="brand">
            Mark it
          </Button>
          <Button type="button" variant="ghost" onClick={() => setChosen(null)}>
            Another
          </Button>
        </div>
      </form>
    );
  }

  if (left.length === 0) return <p className="text-sm text-fg-subtle">Every first is marked.</p>;
  return (
    <ul className="flex flex-col gap-1" aria-label="Which first">
      {left.map((f) => (
        <li key={f.key}>
          <button
            type="button"
            onClick={() => setChosen(f.key)}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-fg-normal hover:bg-bg-normal-hovered"
          >
            <Star aria-hidden size={18} className="text-fg-brand" />
            {f.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
