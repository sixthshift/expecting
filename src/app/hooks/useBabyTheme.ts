import { useEffect } from "react";
import { applyTheme, type Baby, THEMES } from "../../lib/theme";

/**
 * Keep the page in the baby's colours: applied whenever the answer loads
 * or changes. The palette only; light or dark is the phone's (`useTheme` from
 * the design system).
 */
export function useBabyTheme(baby: Baby): void {
  useEffect(() => applyTheme(THEMES[baby]), [baby]);
}
