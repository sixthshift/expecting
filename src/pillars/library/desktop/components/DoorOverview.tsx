import { useNow } from "../../../../api/rpc/settings";
import { TOPICS, VERDICTS } from "../../../../content/schema";
import { DOOR_INFO } from "../../../../lib/library/doors";
import { Verdict } from "../../components/content/Verdict";
import { ItemLink } from "../../components/itemLink/ItemLink";
import { useItems } from "../../hooks/useItems";
import { rangeLabel } from "../../model/labels";
import { type Narrowing, onShelf } from "../../model/narrowing";

/** What each of a "Can I…?" answer's words mean, said once beside the list so the badges in it read. */
const VERDICT_MEANS = {
  yes: "Fine in pregnancy, as the entry says.",
  limit: "Fine within the limits it gives: how much, how often, or how it's made.",
  avoid: "Best left until after the birth. The entry says why, and what to do if you already have.",
  ask: "It depends on you: ask your midwife or doctor, with the question the entry suggests.",
} as const;

/** How many of what's around now it names. */
const AROUND = 6;

/**
 * Beside a door's shelf (or a topic's) on a desktop while no entry is open,
 * in the place an entry reads, so the page keeps its shape: what the door is
 * for, what a "Can I…?" answer's words mean, and what from it is around now
 * (open this week, the soonest to close first), each opening in this place.
 */
export function DoorOverview({ narrowing }: { narrowing: Narrowing }) {
  const items = useItems();
  const now = useNow();
  const { door, topic } = narrowing;
  const info = door ? DOOR_INFO[door] : null;
  const scoped = onShelf(narrowing, items);
  const around =
    now === null
      ? []
      : scoped
          .filter((i) => i.from !== null && i.from <= now && now <= i.to)
          .sort((a, b) => (a.to ?? 0) - (b.to ?? 0))
          .slice(0, AROUND);
  const list = around.map((i) => i.id);

  return (
    <aside
      aria-label="About this shelf"
      className="sticky top-[calc(var(--top-bar)+1.5rem)] flex max-h-[calc(100dvh-var(--top-bar)-3rem)] flex-col gap-8 overflow-y-auto rounded-xl border border-border-subtle bg-bg-normal px-8 py-7"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{info ? "This door" : "This topic"}</p>
        <p className="font-display text-2xl font-semibold text-fg-strong">
          {info?.title ?? (topic ? TOPICS[topic] : "Library")}
          {info && topic ? <span className="text-fg-subtle"> · {TOPICS[topic]}</span> : null}
        </p>
        <p className="max-w-prose text-fg-normal">{info?.lead ?? "Everything on it, by the question it answers."}</p>
        <p className="text-sm text-fg-subtle">Choose one from the list and it opens here.</p>
      </div>

      {door === "can-i" ? (
        <section aria-labelledby="answers-mean" className="flex flex-col gap-3">
          <h2 id="answers-mean" className="text-sm font-semibold text-fg-normal">
            What the answers mean
          </h2>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3">
            {VERDICTS.map((v) => (
              <div key={v} className="contents">
                <dt>
                  <Verdict verdict={v} size="sm" />
                </dt>
                <dd className="text-sm text-fg-normal">{VERDICT_MEANS[v]}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {around.length > 0 ? (
        <section aria-labelledby="around-now" className="flex flex-col gap-3">
          <h2 id="around-now" className="text-sm font-semibold text-fg-normal">
            Around now, at week {now}
          </h2>
          <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle">
            {around.map((item) => (
              <li key={item.id}>
                <ItemLink itemId={item.id} list={list} className="flex min-h-11 items-center gap-3 px-4 py-2.5 hover:bg-bg-normal-hovered">
                  <span className="min-w-0 flex-1 text-fg-strong">{item.title}</span>
                  {item.verdict ? <Verdict verdict={item.verdict} size="sm" /> : <span className="text-xs text-fg-subtle">{rangeLabel(item)}</span>}
                </ItemLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
