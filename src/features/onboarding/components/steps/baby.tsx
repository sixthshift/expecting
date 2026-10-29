import { saveSettings } from "../../../../api/rpc/settings";
import { applyTheme, BABY, type Baby, THEMES } from "../../../../lib/theme";
import type { Screen, StepContext } from "../../model/step";
import { Choices } from "../parts";

/** Boy, girl, or don't know: the colours. */
export function babyStep({ settings, advance }: StepContext): Screen {
  return {
    title: "Do you know if it's a boy or a girl?",
    lead: "It sets Expecting's colours: blue, pink, or both. Anyone who sees your screen will see them, so keeping it a surprise is an answer too.",
    body: (
      <Choices
        options={(Object.keys(BABY) as Baby[]).map((value) => ({ value, label: BABY[value] }))}
        value={settings.baby}
        onChoose={(baby) => {
          applyTheme(THEMES[baby as Baby]);
          return advance(() => saveSettings({ data: { baby: baby as Baby } }));
        }}
      />
    ),
  };
}
