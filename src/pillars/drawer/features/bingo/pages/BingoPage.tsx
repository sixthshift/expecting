import { Button } from "@sixthshift/design-system/button";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { bingoSaves, useBingoQuery } from "../../../../../api/rpc/bingo";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import { deal, standing, standingLine } from "../../../../../lib/drawer/bingo";
import { OTHER_ONE, otherOf } from "../../../../../lib/people";
import { DrawerTool } from "../../../components/tool/DrawerTool";
import { BingoGrid } from "../components/card/BingoGrid";
import { Winner } from "../components/winner/Winner";

const route = getRouteApi("/app/drawer/bingo");

/**
 * Pregnancy bingo: your card, or the other's (`?card=theirs`), each with
 * where it's up to; a bingo said, and who got there first. Your card is dealt
 * here, and dealt again until something's marked. With its extra off, it
 * says so; while something has happened, it's put away.
 */
export function BingoPage() {
  const { data: bingo } = useBingoQuery();
  const { me, people } = usePeopleQuery().data;
  const dealCard = useSave(bingoSaves.dealCard);
  const navigate = route.useNavigate();
  const showing = route.useSearch().card ?? "mine";
  const them = otherOf(people, me);
  const mine = bingo.cards.find((c) => c.personId === me?.id) ?? null;
  const theirs = them ? (bingo.cards.find((c) => c.personId === them.id) ?? null) : null;
  const other = them?.name ?? OTHER_ONE;
  const card = showing === "theirs" ? theirs : mine;

  return (
    <DrawerTool
      title="Pregnancy bingo"
      lead="Mark a square when it happens. Five in a row, a column or a diagonal is bingo; the centre's free."
      width="2xl"
      putAway={{ subject: "Bingo" }}
      extras={["pregnancy-bingo"]}
    >
      {!me ? (
        <p className="text-sm text-fg-normal">Say who's holding this phone, and you'll be dealt a card.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <Winner mine={mine} theirs={theirs} other={other} />
          {them ? (
            <ToggleGroup
              type="single"
              appearance="separate"
              variant="outline"
              intent="brand"
              aria-label="Whose card"
              value={showing}
              onValueChange={(v) => (v ? navigate({ search: { card: v === "theirs" ? "theirs" : undefined }, replace: true, resetScroll: false }) : null)}
              options={[
                { value: "mine", label: mine ? `You · ${standingLine(standing(mine))}` : "You" },
                { value: "theirs", label: theirs ? `${other} · ${standingLine(standing(theirs))}` : other },
              ]}
            />
          ) : null}
          {card ? (
            <>
              <BingoGrid
                card={card}
                owner={other}
                own={showing !== "theirs"}
                other={showing === "theirs" ? { name: "you", card: mine } : { name: other, card: theirs }}
              />
              {showing !== "theirs" && card.marks.length === 0 ? (
                <Button variant="ghost" size="sm" className="w-fit" onClick={() => dealCard({ squares: deal() })}>
                  <Shuffle aria-hidden size={16} /> Deal again
                </Button>
              ) : null}
            </>
          ) : showing === "theirs" ? (
            <p className="text-sm text-fg-subtle">{other} hasn't been dealt a card yet. They deal theirs when they open bingo on their phone.</p>
          ) : (
            <Button intent="brand" className="w-fit" onClick={() => dealCard({ squares: deal() })}>
              <Shuffle aria-hidden size={16} /> Deal my card
            </Button>
          )}
        </div>
      )}
    </DrawerTool>
  );
}
