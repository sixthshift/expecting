# It's time

The page for the night it starts, at `/its-time`. What it does and why is
[`docs/product/its-time.md`](../../../docs/product/its-time.md); this is the
map of the code. Its rules are `src/lib/itsTime.ts`; its store, the
`itsTime` domain (`src/db/models/itsTime/`), read through `useItsTimeQuery`
(`src/api/rpc/itsTime.ts`).

## Words

| Word | Means | Where |
|---|---|---|
| **start** | One go at it: the waters broke or contractions started, until it's ended. One under way at a time (`openStart`). | `Start`, `src/lib/itsTime.ts` |
| **the night** | The start that ended "We're there", with the false alarms before it: one line in the Journal's story (`nightsOf`, `nightLine`). | `Night`, `src/lib/itsTime.ts` |
| **false alarm** | A start ended "False alarm, we're home" (`ended: "home"`): kept here, folded into the night's line once there is one; in the code a night's `falseStarts`. **Sent home** is the kind line after one. | `ENDINGS`, `src/lib/itsTime.ts` |
| **practice run** | The page with nothing started: the two ways in, what's still to ready, and the rest of the page greyed, as the night will show it. | `pages/ItsTimePage.tsx` |
| **home** | A home birth (`birthPlace: "home"`): the midwife first, no trip and no bag, the hospital the backup. | `atHome`, `model/ready.ts` |
| **ready** | What the night's page needs and doesn't have yet, each a tap to where it's filled in. | `stillToReady`, `model/ready.ts` |
| **the bag** | The hospital bag, It's time's own list (`bag` in `LISTS`); its **last things** go in only on the night and are ticked here. | `bagOf`, `model/ready.ts` |
| **call now** | The red flags, in the Library's words: call the birth suite, or 000. | `flagsFor`, `model/callNow.ts` |
| **they'll ask** | The phone call, already answered, in the order a midwife asks. | `theyllAsk`, `model/theyllAsk.ts` |
| **before you go** | The last things, ticked for this start only, and your **own lines**, kept between starts (`StartLine`). | `components/beforeYouGo/` |
| **the way in** | The pill or sidebar row that opens the page, from week 36 (32 for twins), and This week's **look-through** card, once a phone. | `useItsTimeShown`, `components/wayIn/` |

## From the store to the screen

```
queries (itsTime, people, answers, emergency, checklist, lists, settings)
  → ItsTimePage             Emergency info instead while something has happened
  → ItsTimePageProvider     the start, home, who's who, worked out once    contexts/
  → ItsTime                 the parts, in the night's order               pages/
  → each part               reads the context, and its own queries        components/<part>/
  → the rules               stillToReady, bagOf, flagsFor, theyllAsk      model/, lib/itsTime.ts
```

The context holds only what's worked out: Emergency info's values, the
answers, the bag and the ticks stay in the query cache, each part reading
what it needs through their hooks.

## Where things are

```
pages/          ItsTimePage: the redirect while quiet, the provider, the parts in order
contexts/       ItsTimePageContext: the start, home, me, partner, carrying
hooks/          useItsTimeShown (the way in), useClock, useWakeLock
model/          ready (stillToReady, bagOf, atHome), callNow, theyllAsk, looked (the look-through, per phone)
components/
  Part          a part's heading, then what's in it
  CallButton    a call, big enough for one hand
  top/          where it's at, and the calls (Alarm for a call your own tap set off)
  ready/        the practice run's two ways in, and what's still to ready
  callNow/      call now, don't wait, if
  timer/        the contractions, a row each
  waters/       the waters' time and colour
  theyllAsk/    when you ring, they'll ask
  beforeYouGo/  the last things, your own lines, "We're leaving"
  gettingThere/ the hospital, getting in, a backup driver
  end/          we're there, or a false alarm, asked twice
  night/        a night in full, opened from its Journal line
  wayIn/        the pill or row in the frame, and This week's look-through card
```

## Adding a part

1. Its folder, `components/<part>/<Part>.tsx`, with no props: read `start`
   and `home` from `useItsTimePage()`, and anything else through its query's
   hook. One that only draws on the night can take the open `start`, as
   `Timer` and `Waters` do.
2. Wrap it in `Part` with an id and a title, and put it in `ItsTime`
   (`pages/ItsTimePage.tsx`) in the night's order; inside the greyed block if
   the practice run shows it too.
3. A rule (what to say, what's missing) goes in `model/`, beside its kin,
   with a test in `test/features/itsTime/model.test.ts`.

A thing still to ready is one line in `stillToReady`, and a last thing of
the bag's is a line on the `bag` list in its item's `lines`
(`section: last`).
