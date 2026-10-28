import { useEffect } from "react";
import { applyTheme, type Baby, THEMES } from "../../lib/theme";

/** Keep the page in the household's theme: applied whenever the answer loads or changes. */
export function useExpectingTheme(baby: Baby): void {
  useEffect(() => applyTheme(THEMES[baby]), [baby]);
}
