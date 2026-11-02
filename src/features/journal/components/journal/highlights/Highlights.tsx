import { getRouteApi } from "@tanstack/react-router";
import { useJournalPage } from "../../../contexts/JournalPageContext";
import { Lately } from "./Lately";
import { NowCards } from "./NowCards";

const route = getRouteApi("/app/journal");

/** The highlights beside the story: what matters now, then Lately, each pattern opening its lens. */
export function Highlights() {
  const { items, highlights } = useJournalPage();
  const navigate = route.useNavigate();
  return (
    <>
      <NowCards cards={highlights.cards} items={items} onRecapOpened={highlights.onRecapOpened} />
      <Lately patterns={highlights.patterns} onOpen={(l) => navigate({ search: { show: l } })} />
    </>
  );
}
