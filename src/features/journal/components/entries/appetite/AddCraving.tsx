import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { type FormEvent, useState } from "react";
import { appetiteSaves, useAppetiteQuery } from "../../../../../api/rpc/appetite";
import { useSave } from "../../../../../app/hooks/useSave";
import { cravingChips, notFood, notFoodQuestion } from "../../../../../lib/appetite";
import { todayISO } from "../../../../../lib/dates";
import { timeNow } from "../../../../../lib/journal";
import { newId } from "../../../../../lib/outbox";
import { ItemLink } from "../../../../library/components/ItemLink";
import { KIND_OPTIONS } from "./AppetiteFields";
import { AskAtAppointment } from "./AskAtAppointment";

const CRAVINGS = "food-cravings-and-aversions";

/** Craving something that isn't food: worth mentioning, as `food-cravings-and-aversions` says. Quiet: not an alert and not a call. */
function NotFood({ what }: { what: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3 text-sm">
      <p className="text-fg-normal">
        Craving things that aren't food, like ice, chalk or clay, is worth mentioning to your midwife or doctor: it's been linked to low iron.
      </p>
      <AskAtAppointment text={notFoodQuestion(what)} />
      <ItemLink itemId={CRAVINGS} className="flex min-h-11 items-center text-fg-normal underline">
        About cravings
      </ItemLink>
    </div>
  );
}

/**
 * A craving, or something gone off: what, then Keep. What's been craved
 * before is a chip under the box, so the second pickle is one tap. A craving
 * for something that isn't food keeps the quiet word about it on screen
 * until Done.
 */
export function AddCraving({ onAdded }: { onAdded?: (id: string) => void }) {
  const { data: entries } = useAppetiteQuery();
  const add = useSave(appetiteSaves.addAppetite);
  const [kind, setKind] = useState<"craving" | "off">("craving");
  const [what, setWhat] = useState("");
  // A craving for something that isn't food, just kept: the word about it, until Done.
  const [notFoodKept, setNotFoodKept] = useState<{ id: string; what: string } | null>(null);
  const chips = cravingChips(entries, kind);

  function keep(text: string) {
    if (text.trim().length === 0) return;
    const id = newId();
    add({ id, kind, day: todayISO(), time: timeNow(), how: null, what: text, note: null });
    setWhat("");
    if (kind === "craving" && notFood(text)) setNotFoodKept({ id, what: text.trim() });
    else onAdded?.(id);
  }

  if (notFoodKept) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-normal">Kept: {notFoodKept.what}.</p>
        <NotFood what={notFoodKept.what} />
        <Button
          variant="outline"
          onClick={() => {
            setNotFoodKept(null);
            onAdded?.(notFoodKept.id);
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    keep(what);
  }

  const label = kind === "craving" ? "What are you craving?" : "What have you gone off?";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        appearance="segmented"
        size="sm"
        variant="outline"
        intent="brand"
        aria-label="Craving or gone off"
        className="self-start"
        value={kind}
        onValueChange={(value) => setKind(value as "craving" | "off")}
        options={KIND_OPTIONS}
      />
      <Input
        value={what}
        onChange={(e) => setWhat(e.target.value)}
        placeholder={kind === "craving" ? "Pickles, ice, hot chips…" : "Coffee, onions…"}
        aria-label={label}
        maxLength={200}
      />
      {chips.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-fg-subtle">Again? One tap keeps it.</p>
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip}>
                <Button type="button" variant="outline" size="sm" onClick={() => keep(chip)} aria-label={`Keep ${chip.trim()} again`}>
                  {chip.trim()}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Button type="submit" intent="brand" disabled={what.trim().length === 0} className="self-start">
        Keep it
      </Button>
    </form>
  );
}
