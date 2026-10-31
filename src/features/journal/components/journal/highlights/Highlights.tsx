import { getRouteApi } from "@tanstack/react-router";
import type { HighlightsData } from "../../../hooks/useHighlights";
import { useStory } from "../../../hooks/useStory";
import { Lately } from "./Lately";
import { NowCards } from "./NowCards";

const route = getRouteApi("/app/journal");

/** The highlights beside the story: what matters now, then Lately, each pattern opening its lens. */
export function Highlights({ highlights }: { highlights: HighlightsData }) {
  const items = useStory();
  const navigate = route.useNavigate();
  return (
    <>
      <NowCards cards={highlights.cards} items={items} onRecapOpened={highlights.onRecapOpened} />
      <Lately patterns={highlights.patterns} onOpen={(l) => navigate({ search: { show: l } })} />
    </>
  );
}
