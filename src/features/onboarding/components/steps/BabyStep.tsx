import { saveSettings, useSettingsQuery } from "../../../../api/rpc/settings";
import { applyTheme, BABY, type Baby, THEMES } from "../../../../lib/theme";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { Choices } from "../Choices";
import { OnboardingFrame } from "../OnboardingFrame";

/** Boy, girl, or don't know: the colours. */
export function BabyStep() {
  const { data: baby } = useSettingsQuery({ select: (s) => s.baby });
  const { advance } = useOnboardingPage();
  return (
    <OnboardingFrame
      title="Do you know if it's a boy or a girl?"
      lead="It sets Expecting's colours: blue, pink, or both. Anyone who sees your screen will see them, so keeping it a surprise is an answer too."
    >
      <Choices
        options={(Object.keys(BABY) as Baby[]).map((value) => ({ value, label: BABY[value] }))}
        value={baby}
        onChoose={(next) => {
          applyTheme(THEMES[next as Baby]);
          return advance(() => saveSettings({ data: { baby: next as Baby } }));
        }}
      />
    </OnboardingFrame>
  );
}
