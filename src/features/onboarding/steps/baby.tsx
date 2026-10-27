import { applyTheme, BABY, type Baby, THEMES } from "../../../lib/theme";
import { saveHousehold } from "../../../server/functions/household";
import { Choices } from "../parts";
import type { Screen, StepContext } from "../step";

/** Boy, girl, or don't know: the colours. */
export function babyStep({ state, advance }: StepContext): Screen {
  const { household } = state;
  return {
    title: "Do you know if it's a boy or a girl?",
    lead: "It sets Expecting's colours: blue, pink, or both. Anyone who sees your screen will see them, so keeping it a surprise is an answer too.",
    body: (
      <Choices
        options={(Object.keys(BABY) as Baby[]).map((value) => ({ value, label: BABY[value] }))}
        value={household.baby}
        onChoose={(baby) => {
          applyTheme(THEMES[baby as Baby]);
          return advance(() => saveHousehold({ data: { baby: baby as Baby } }));
        }}
      />
    ),
  };
}
