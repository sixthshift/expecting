// Which of Expecting's three themes is showing, from the one question it asks:
// boy, girl, or don't know (which covers keeping it a surprise). The themes
// themselves are CSS (src/styles/theme/); this only chooses one.

export const BABY = {
  boy: "Boy",
  girl: "Girl",
  unknown: "Don't know / surprise",
} as const;

export type Baby = keyof typeof BABY;

export const THEMES = { boy: "baby-blue", girl: "baby-pink", unknown: "baby-purple" } as const satisfies Record<Baby, string>;

export type Theme = (typeof THEMES)[Baby];

/** Where the browser remembers the theme, so a reload paints in it before any data arrives. */
export const THEME_STORAGE_KEY = "expecting-theme";

/** Show `theme` now and remember it for the next load. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.expectingTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing: the theme still shows, it just isn't remembered.
  }
}

/**
 * Runs in <head> before the page paints, so a returning phone opens in its
 * theme rather than flashing Baby Purple first. Inlined as a string: nothing has
 * loaded yet when it runs.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="baby-blue"||t==="baby-pink"||t==="baby-purple")document.documentElement.dataset.expectingTheme=t}catch(e){}`;
