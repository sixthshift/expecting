import { Switch } from "@sixthshift/design-system/switch";
import { cn } from "@sixthshift/design-system/utils";
import { useState } from "react";
import { setExtras } from "../../api/rpc/extras";
import { EXTRA_GROUPS, type ExtraGroup } from "../../content/extras";
import { formatDate, todayISO } from "../../lib/dates";
import { type Choice, extrasFor } from "../../lib/extras";
import type { Person } from "../../lib/people";
import { useAction } from "../household/useAction";
import { useApp } from "../household/useApp";
import { SettingList } from "../settings/SettingRow";

/**
 * Every extra in content/extras.yaml this household is offered (its `when`
 * fits, or it's on), with its switch: on, its items appear
 * wherever they belong; off, they're gone. Each says who last changed it.
 * `highlight` marks the one a link opened settings at.
 */
export function ExtrasList({ choices, people, highlight }: { choices: readonly Choice[]; people: readonly Person[]; highlight?: string }) {
  const { facts, extras } = useApp();
  const [save] = useAction((id: string, on: boolean) => setExtras({ data: [{ id, on }] }));
  const [pending, setPending] = useState<string | null>(null);

  const offered = extrasFor(facts, extras);

  return (
    <div className="flex flex-col gap-4">
      {(Object.entries(EXTRA_GROUPS) as [ExtraGroup, string][]).map(([group, title]) => {
        const inGroup = offered.filter((e) => e.group === group);
        if (inGroup.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-fg-normal">{title}</h3>
            <SettingList>
              {inGroup.map((e) => {
                const choice = choices.find((c) => c.id === e.id);
                const on = choice?.on ?? false;
                const control = `extra-${e.id}`;
                return (
                  <div
                    key={e.id}
                    id={`setting-extra:${e.id}`}
                    className={cn("flex scroll-mt-24 items-center gap-4 px-4 py-3", highlight === e.id && "bg-bg-brand-subtle")}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <label htmlFor={control} className="text-sm font-medium text-fg-strong">
                        {e.name}
                      </label>
                      <span className="text-xs text-fg-subtle">{e.pitch}</span>
                      {choice ? <span className="text-xs text-fg-subtle">{changedBy(choice, people)}</span> : null}
                    </div>
                    <Switch
                      id={control}
                      checked={on}
                      pending={pending === e.id}
                      onCheckedChange={async (next) => {
                        setPending(e.id);
                        try {
                          await save(e.id, next);
                        } finally {
                          setPending(null);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </SettingList>
          </div>
        );
      })}
    </div>
  );
}

/** "Sam turned it on, 3 Oct". */
function changedBy(c: Choice, people: readonly Person[]): string {
  const who = people.find((p) => p.id === c.changedBy)?.name;
  const when = formatDate(todayISO(new Date(c.changedAt)), { day: "numeric", month: "short" });
  const what = c.on ? "turned it on" : "turned it off";
  return who ? `${who} ${what}, ${when}` : `${what[0]!.toUpperCase()}${what.slice(1)}, ${when}`;
}
