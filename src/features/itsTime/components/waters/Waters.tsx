import { Button } from "@sixthshift/design-system/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import { clock, type Start, WATERS, WATERS_LABEL } from "../../../../lib/itsTime";
import { ItemLink } from "../../../library/components/ItemLink";
import { Part } from "../CallButton";

/**
 * The waters: one tap keeps the time, the first thing they'll ask; then the
 * colour (`card-waters-colour`). Green, brown or blood-coloured puts the call
 * at the top of the page. Not sure whether they have is fine too: it's a
 * call all the same (`waters-breaking`).
 */
export function Waters({ start }: { start: Start }) {
  const set = useSave(itsTimeSaves.setWaters);
  const [changing, setChanging] = useState(false);
  const asking = start.watersAt !== null && (start.waters === null || changing);

  return (
    <Part id="waters" title="Waters">
      {start.watersAt === null ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" variant="outline" className="min-h-14 flex-1" onClick={() => set({ waters: null })}>
            Waters broke
          </Button>
          <Button size="lg" variant="ghost" className="min-h-14 flex-1" onClick={() => set({ waters: "unsure" })}>
            Not sure if they have
          </Button>
        </div>
      ) : asking ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-fg-strong">
            Broke {clock(start.watersAt)}. What colour are they?{" "}
            <span className="text-fg-subtle">Usually clear, but they can be yellow, straw-coloured or pink.</span>
          </legend>
          {WATERS.map((w) => (
            <Button
              key={w}
              size="lg"
              variant={start.waters === w ? "solid" : "outline"}
              intent={start.waters === w ? "brand" : undefined}
              className="min-h-12 justify-start"
              onClick={() => {
                set({ waters: w });
                setChanging(false);
              }}
            >
              {WATERS_LABEL[w]}
            </Button>
          ))}
        </fieldset>
      ) : (
        <p className="flex flex-wrap items-center gap-x-3 text-fg-strong">
          {start.waters === "unsure"
            ? `Maybe, from ${clock(start.watersAt)}: not sure`
            : `Broke ${clock(start.watersAt)}, ${WATERS_LABEL[start.waters!].toLowerCase()}`}
          <button type="button" className="min-h-11 text-sm text-fg-subtle underline" onClick={() => setChanging(true)}>
            Change
          </button>
        </p>
      )}
      <ItemLink itemId="waters-breaking" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        Waters breaking
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </Part>
  );
}
