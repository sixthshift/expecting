import { Link } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { type Item, TOPICS, type Topic, VERDICTS, type Verdict } from "../../../../content/schema";
import { behind, DOOR_INFO, type Door, forPartner, type Group, topicByDoor, topicsIn } from "../../../../lib/library";
import { VERDICT } from "../content/Verdict";
import { Cards } from "./Cards";
import { Glossary } from "./Glossary";
import { Rows } from "./Rows";

/** What a shelf is narrowed by, as the Library's search params hold it. */
export type Narrowing = { door?: Door; topic?: Topic; verdict?: Verdict; for?: "partner" };

/**
 * A door opened, or a topic on its own: its title, the chips that narrow it
 * (topic, a can-i's verdict, for the partner), then its entries laid out for
 * their question — rows under headings, cards, or the glossary. A topic on its
 * own is grouped by door.
 */
export function Shelf({ items, narrowing }: { items: readonly Item[]; narrowing: Narrowing }) {
  const { door, topic, verdict } = narrowing;
  const partner = narrowing.for === "partner";
  const info = door ? DOOR_INFO[door] : null;
  const scoped = (door ? behind(door, items) : items.filter((i) => i.topic === topic)).filter((i) => !partner || forPartner(i));
  const inTopic = door && topic ? scoped.filter((i) => i.topic === topic) : scoped;
  const shown = verdict ? inTopic.filter((i) => i.verdict === verdict) : inTopic;
  const groups: Group[] = info ? info.group(shown) : topicByDoor(shown);
  const title = info?.title ?? (topic ? TOPICS[topic] : "Library");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link to="/library" className="-ml-2 mb-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
          <ArrowLeft aria-hidden size={16} /> Library
        </Link>
        <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">
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
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <section key={g.key} aria-label={g.title} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{g.title}</h2>
              <Rows items={g.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Is this normal? opens with when not to wait: before any list, for someone worried now. */
function GetHelp() {
  return (
    <aside aria-label="Worried now?" className="flex flex-col gap-2 rounded-xl border border-border-danger bg-bg-danger-subtle p-4">
      <p className="font-semibold text-fg-danger">Worried now? Don't wait to read.</p>
      <p className="text-sm text-fg-normal">
        In an emergency call 000. Otherwise call your hospital's birth suite or your midwife: they would rather hear from you.
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
        <a href="tel:000" className="flex min-h-11 items-center gap-1.5 text-fg-danger underline">
          <Phone aria-hidden size={14} /> Call 000
        </a>
        <Link to="/drawer/emergency" className="flex min-h-11 items-center text-fg-strong underline">
          Your numbers, in Emergency info
        </Link>
      </div>
    </aside>
  );
}

/** A row of chips that narrow a shelf: one line that scrolls sideways on a phone, wrapping on a desktop. */
function Chips({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      {children}
    </nav>
  );
}

function Chip({ search, active, count, children }: { search: Narrowing; active: boolean; count?: number; children: ReactNode }) {
  return (
    <Link
      to="/library"
      search={search}
      replace
      // The router marks a link to exactly this page as current; "For the partner" links to turning itself off, so say it's on here.
      activeOptions={{ exact: true, includeSearch: true, explicitUndefined: true }}
      inactiveProps={{ "aria-current": active ? "page" : undefined }}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap ${
        active
          ? "border-border-brand bg-bg-brand-subtle font-medium text-fg-brand"
          : "border-border-subtle bg-bg-normal text-fg-normal hover:border-border-normal"
      }`}
    >
      {children}
      {count !== undefined ? <span className={active ? "text-fg-brand" : "text-fg-subtle"}>{count}</span> : null}
    </Link>
  );
}
