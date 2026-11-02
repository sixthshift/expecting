import { Link } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { useEffect } from "react";
import { readsSaves, useReadsQuery } from "../../../../api/rpc/reads";
import { useSave } from "../../../../app/hooks/useSave";
import { weekInSentence } from "../../../../lib/labels";
import { QUIET_ITEM } from "../../../../lib/quiet";
import { PapersAbout } from "../../../journal/components/entries/papers/PaperList";
import { QuestionsAbout } from "../../../questions/components/QuestionsAbout";
import { QuietSwitch } from "../../../quiet/components/quietSwitch/QuietSwitch";
import { useEntry } from "../../contexts/LibraryItemPageContext";
import { AskAtAppointment } from "../askAtAppointment/AskAtAppointment";
import { Related } from "../related/Related";
import { ItemCard } from "./ItemCard";

/** The item with its page, once loaded: the card, a question to ask at the next appointment and those asked from it, the papers you kept about it, its week in the whole pregnancy, and what it links to. Something has happened's guide has its switch. */
export function Entry() {
  const { item } = useEntry();
  // Opened is read: marked once its words are on the page. Never a private entry, which leaves no trace.
  const { data: read } = useReadsQuery({ select: (reads) => Boolean(reads[item.id]) });
  const markRead = useSave(readsSaves.markRead);
  useEffect(() => {
    if (!item.private && !read) markRead({ itemId: item.id });
  }, [item.id, item.private, read, markRead]);
  return (
    <>
      <ItemCard />
      {item.id === QUIET_ITEM ? <QuietSwitch /> : null}
      <AskAtAppointment />
      {/* What you kept about it: never under a private entry, which nothing can point at. */}
      {item.private ? null : <QuestionsAbout itemId={item.id} />}
      {item.private ? null : <PapersAbout itemId={item.id} />}
      {item.from !== null ? (
        <Link
          to="/timeline"
          search={{ at: item.from }}
          replace={item.private}
          className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal"
        >
          <CalendarRange aria-hidden size={16} className="text-fg-brand" />
          See {weekInSentence(item.from)} in the whole pregnancy
        </Link>
      ) : null}
      <Related />
    </>
  );
}
