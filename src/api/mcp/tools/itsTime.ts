// It's time's tool: your own plan for the night it starts, as the page has
// it: when to call and who, getting there, what they'll ask, what's still to
// ready, the bag, and the start under way, if there is one. Read only: the
// night itself is timed on a phone, not in a conversation.

import { flagsFor } from "../../../app/features/itsTime/model/callNow";
import { atHome, bagOf, stillToReady } from "../../../app/features/itsTime/model/ready";
import { theyllAsk } from "../../../app/features/itsTime/model/theyllAsk";
import { EmergencyRepo } from "../../../db/models/emergency/repo";
import { ItsTimeRepo } from "../../../db/models/itsTime/repo";
import { ListsRepo } from "../../../db/models/lists/repo";
import { openStart, patternOf, sayPattern, shownFrom, WATERS_LABEL } from "../../../lib/itsTime";
import { tailorLines } from "../../../lib/planner/lists/lines";
import { answer, type Tools } from "../answer";
import { known } from "../context";

export function itsTimeTools({ ctx, read }: Tools) {
  read(
    "its_time",
    {
      title: "It's time",
      description:
        "Your own plan for the night labour starts, as Expecting's It's time page has it: when to ring the birth suite (or midwife) and when 000, their numbers, the hospital and getting in, what they'll ask on the phone, what's still to get ready, how the bag is going, and the start under way if there is one (contractions, waters). Answer from this plan, not a general one; for anything on the call-now list, say to call now.",
    },
    () => {
      const c = ctx();
      const k = known(c);
      const { values: v } = new EmergencyRepo(c.db).get();
      const { starts } = new ItsTimeRepo(c.db).get();
      const start = openStart({ starts, lines: [] });
      const pattern = start ? patternOf(start.contractions, c.now) : null;
      const { ownLines, marks } = new ListsRepo(c.db).all();
      const bag = bagOf(tailorLines(k.items, k.facts, ownLines), marks);
      const home = atHome(k.facts);
      const flags = flagsFor(k.facts);
      return answer({
        shownFrom: shownFrom(k.facts),
        homeBirth: home,
        call: {
          birthSuite: v.birthSuitePhone ?? null,
          midwife: v.carerPhone ?? null,
          ringNowIf: flags.call.map((f) => ({ text: f.text, entry: f.from })),
          tripleZeroIf: flags.tripleZero.map((f) => ({ text: f.text, entry: f.from })),
          whatTheySaid: v.hospitalSaid ?? null,
        },
        gettingThere: { hospital: v.hospital ?? null, wayIn: v.hospitalWayIn ?? null, backupDriver: v.backupDriver ?? null, minder: v.minder ?? null },
        theyllAsk: theyllAsk({
          values: v,
          facts: k.facts,
          carrying: k.people.find((p) => p.role === "carrying")?.name ?? null,
          dueDate: k.dueDate,
          today: k.today,
          start,
          pattern,
          holding: k.me?.role ?? null,
        }).map((r) => ({ [r.label]: r.value })),
        stillToReady: stillToReady({ values: v, facts: k.facts, ticks: k.ticks }).map((t) => t.text),
        bag: home ? null : { packed: bag.packed, of: bag.total, lastThings: bag.lastThings.map((l) => l.title) },
        underWay: start
          ? {
              started: start.startedAt,
              waters: start.watersAt ? { at: start.watersAt, colour: start.waters ? WATERS_LABEL[start.waters] : null } : null,
              contractions: start.contractions.length,
              pattern: pattern ? sayPattern(pattern) : null,
              inLastTenMinutes: pattern?.inTen ?? 0,
              left: start.leftAt,
            }
          : null,
      });
    }
  );
}
