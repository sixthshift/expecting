import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { useState } from "react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { quietSaves, useQuietQuery } from "../../../../api/rpc/quiet";
import { useSave } from "../../../../app/hooks/useSave";
import { formatDate, todayISO } from "../../../../lib/dates";
import { QUIET_KINDS, QUIET_LABELS, type QuietKind, WAY_BACK } from "../../../../lib/quiet";

/**
 * Something has happened: the way in, and while it stands, the way back. In
 * Settings and on the guide's own page. Nothing is asked but what happened;
 * it quiets Expecting for both of you. Hard news can become a loss, and comes
 * back as it was; a loss can only be undone as a mistake.
 */
export function QuietSwitch() {
  const { data: quiet } = useQuietQuery();
  const { people } = usePeopleQuery().data;
  const [choosing, setChoosing] = useState(false);
  const [kind, setKind] = useState<QuietKind | null>(null);
  const [leaving, setLeaving] = useState(false);
  const setQuiet = useSave(quietSaves.setQuiet);
  const set = (next: QuietKind) => setQuiet({ kind: next });
  const clear = useSave(quietSaves.clearQuiet);

  if (quiet) {
    const by = people.find((p) => p.id === quiet.setBy)?.name;
    const since = formatDate(todayISO(new Date(quiet.setAt)), { day: "numeric", month: "long" });
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4">
        <p className="text-sm text-fg-normal">
          Expecting has been quiet since {since}
          {by ? `, when ${by} said ${quiet.kind === "loss" ? "you'd lost the baby" : "you'd had hard news"}` : null}. It stays this way until you choose.
        </p>
        {leaving ? (
          <div className="flex flex-col gap-3 rounded-lg bg-bg-subtle p-3">
            <p className="text-sm text-fg-normal">
              {quiet.kind === "news"
                ? "Bring the weeks back? The week, the countdown and the tasks return for both of you, as they were."
                : "Bring Expecting back as it was? The weeks, the countdown and the tasks return for both of you."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                intent="brand"
                onClick={() => {
                  clear(null);
                  setLeaving(false);
                }}
              >
                Yes, bring them back
              </Button>
              <Button variant="outline" onClick={() => setLeaving(false)}>
                Not now
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {quiet.kind === "news" ? (
              <Button variant="outline" onClick={() => set("loss")}>
                We've lost the baby
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setLeaving(true)}>
              {WAY_BACK[quiet.kind]}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!choosing) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
        <p className="text-sm text-fg-normal">
          If you've lost your baby, or had news that changes everything, Expecting can go quiet for both of you: the weeks, the countdown and the tasks put away
          until you choose, and support in their place.
        </p>
        <Button variant="outline" className="self-start" onClick={() => setChoosing(true)}>
          Something has happened
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <p className="text-sm font-medium text-fg-strong">We're so sorry. What has happened?</p>
      <div role="radiogroup" aria-label="What has happened?" className="flex flex-col gap-2">
        {QUIET_KINDS.map((k) => (
          <label
            key={k}
            className={cn(
              "relative flex min-h-14 cursor-pointer flex-col justify-center gap-0.5 rounded-lg border px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring",
              kind === k ? "border-border-brand ring-1 ring-border-brand" : "border-border-subtle hover:border-border-normal"
            )}
          >
            <input
              type="radio"
              name="quiet-kind"
              value={k}
              checked={kind === k}
              onChange={() => setKind(k)}
              // Over the whole choice, unseen: the choice is what's tapped.
              className="absolute inset-0 cursor-pointer appearance-none opacity-0"
            />
            <span className="font-medium text-fg-strong">{QUIET_LABELS[k].choose}</span>
            <span className="text-sm text-fg-subtle">{QUIET_LABELS[k].detail}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          intent="brand"
          disabled={kind === null}
          onClick={() => {
            if (!kind) return;
            set(kind);
            setChoosing(false);
          }}
        >
          Make Expecting quiet
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setChoosing(false);
            setKind(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
