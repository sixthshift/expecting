import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { TOPICS, VERDICTS } from "../../../../content/schema";
import { behind, DOOR_INFO, forPartner, type Group, topicByDoor, topicsIn } from "../../../../lib/library/doors";
import { useItems } from "../../hooks/useItems";
import type { Narrowing } from "../../model/narrowing";
import { VERDICT } from "../content/Verdict";
import { Cards } from "./Cards";
import { Chip } from "./Chip";
import { Chips } from "./Chips";
import { GetHelp } from "./GetHelp";
import { Glossary } from "./Glossary";
import { RowColumns } from "./RowColumns";

/**
 * A door opened, or a topic on its own: its title, the chips that narrow it
 * (topic, a can-i's verdict, for the partner), then its entries laid out for
 * their question — rows under headings, in as many columns as fit
 * (`RowColumns`), cards, or the glossary. A topic on its own is grouped by
 * door.
 */
export function Shelf({ narrowing }: { narrowing: Narrowing }) {
  const items = useItems();
  const { door, topic, verdict } = narrowing;
  const partner = narrowing.for === "partner";
  const info = door ? DOOR_INFO[door] : null;
  const scoped = (door ? behind(door, items) : items.filter((i) => i.topic === topic)).filter((i) => !partner || forPartner(i));
  const inTopic = door && topic ? scoped.filter((i) => i.topic === topic) : scoped;
  const shown = verdict ? inTopic.filter((i) => i.verdict === verdict) : inTopic;
  const groups: Group[] = info ? info.group(shown) : topicByDoor(shown);
  // An entry opened from the shelf swipes through the whole shelf, group after group.
  const list = groups.flatMap((g) => g.items.map((i) => i.id));
  const title = info?.title ?? (topic ? TOPICS[topic] : "Library");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link to="/library" className="-ml-2 mb-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
          <ArrowLeft aria-hidden size={16} /> Library
        </Link>
        <h1 className="text-2xl font-display font-semibold text-fg-strong desktop:text-3xl">
          {title}
          {door && topic ? <span className="text-fg-subtle"> · {TOPICS[topic]}</span> : null}
        </h1>
        <p className="max-w-prose text-fg-subtle">{info?.lead ?? "Everything on it, by the question it answers."}</p>
      </header>

      <div className="flex flex-col gap-2">
        {door && door !== "surprises" ? (
          <Chips label="Topic">
            <Chip search={{ ...narrowing, topic: undefined, verdict: undefined }} active={!topic} count={scoped.length}>
              All
            </Chip>
            {topicsIn(scoped).map((t) => (
              <Chip key={t.topic} search={{ ...narrowing, topic: t.topic, verdict: undefined }} active={topic === t.topic} count={t.count}>
                {t.title}
              </Chip>
            ))}
          </Chips>
        ) : null}
        {door === "can-i" ? (
          <Chips label="Answer">
            <Chip search={{ ...narrowing, verdict: undefined }} active={!verdict} count={inTopic.length}>
              Any answer
            </Chip>
            {VERDICTS.map((v) => {
              const count = inTopic.filter((i) => i.verdict === v).length;
              return count > 0 ? (
                <Chip key={v} search={{ ...narrowing, verdict: v }} active={verdict === v} count={count}>
                  {VERDICT[v].label}
                </Chip>
              ) : null;
            })}
          </Chips>
        ) : null}
        <Chips label="Who for">
          <Chip search={{ ...narrowing, for: partner ? undefined : "partner", topic: door ? undefined : topic, verdict: undefined }} active={partner}>
            For the partner
          </Chip>
        </Chips>
      </div>

      {door === "normal" ? <GetHelp /> : null}

      {groups.length === 0 ? (
        <p className="text-fg-subtle">Nothing here{partner ? " for the partner" : ""} yet.</p>
      ) : info?.layout === "glossary" ? (
        <Glossary groups={groups} />
      ) : info?.layout === "cards" ? (
        <Cards items={groups.flatMap((g) => g.items)} />
      ) : (
        <RowColumns groups={groups} list={list} />
      )}
    </div>
  );
}
