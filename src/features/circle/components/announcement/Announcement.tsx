import { Button } from "@sixthshift/design-system/button";
import { toast } from "@sixthshift/design-system/overlay";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { circleSaves } from "../../../../api/rpc/circle";
import { useSave } from "../../../../app/hooks/useSave";
import { type CirclePerson, HEARS, type Hears, round, type Announcement as Words } from "../../../../lib/circle";
import { handOff } from "../../model/share";

/**
 * The words for the birth, written ahead by either of you, and on the day a
 * way to hand them to each round: the share sheet, where you choose who gets
 * them. Expecting sends nothing.
 */
export function Announcement({ words, people }: { words: Words; people: readonly CirclePerson[] }) {
  const [body, setBody] = useState(words?.body ?? "");
  const save = useSave(circleSaves.setAnnouncement);
  const changed = body.trim() !== (words?.body ?? "");

  async function share(hears: Hears) {
    const handed = await handOff(words?.body ?? "");
    if (handed === "copied") toast({ title: `Copied, for ${HEARS[hears].toLowerCase()}` });
  }

  return (
    <section aria-labelledby="announcement" className="flex flex-col gap-3 rounded-xl border border-border-subtle p-4">
      <h2 id="announcement" className="font-display font-semibold text-fg-strong">
        The words for the birth
      </h2>
      <p className="text-sm text-fg-subtle">Write them now, while there's time. On the day, fill in the name and the time, and share them a round at a time.</p>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="The words for the birth"
        placeholder="She's here! Born at… weighing…"
        rows={3}
        maxLength={2000}
      />
      {changed ? (
        <Button intent="brand" size="sm" className="w-fit" onClick={() => save({ body })}>
          Keep the words
        </Button>
      ) : null}
      {words && !changed ? (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(HEARS) as Hears[]).map((hears) => {
            const who = round(people, hears);
            if (who.length === 0) return null;
            return (
              <Button key={hears} variant="outline" size="sm" onClick={() => share(hears)}>
                <Share2 aria-hidden size={16} /> Share: {HEARS[hears].toLowerCase()} ({who.length})
              </Button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
