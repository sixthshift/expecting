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
 * Where the design system keeps this phone's mode (light, dark, or "system":
 * match the phone), as JSON. Its `bootstrapTheme()` and `useTheme()` own it;
 * the boot script only reads it, so the two never disagree.
 */
export const MODE_STORAGE_KEY = "theme";

/**
 * Runs in <head> before the page paints, so a returning phone opens in its
 * theme and its mode rather than flashing Baby Purple, or white at night.
 * Inlined as a string: nothing has loaded yet when it runs.
 */
export const THEME_BOOT_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="baby-blue"||t==="baby-pink"||t==="baby-purple")d.dataset.expectingTheme=t}catch(e){}try{var m=JSON.parse(localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)})||'"system"');if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=m}catch(e){}`;

/**
 * Point the phone's bar (`<meta name="theme-color">`) at the page as it is
 * drawn now, so the status bar matches it in either mode and any theme.
 */
export function paintThemeColour(): void {
  const page = getComputedStyle(document.documentElement).getPropertyValue("--expecting-page").trim();
  if (!page) return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  meta.content = page;
}

/**
 * The browser tab's icon in each theme: the Baby on a tile of the theme's
 * brand colour, Baby Purple's the default in root.tsx's link. The installed
 * app's icon is another, the same for everyone (public/icon.svg).
 */
export const FAVICONS = {
  "baby-blue": "/favicon-baby-blue.svg",
  "baby-pink": "/favicon-baby-pink.svg",
  "baby-purple": "/favicon.svg",
} as const satisfies Record<Theme, string>;

/** Point the tab's icon at the theme showing now. */
export function paintFavicon(): void {
  const theme = document.documentElement.dataset.expectingTheme as Theme | undefined;
  const href = FAVICONS[theme ?? "baby-purple"] ?? FAVICONS["baby-purple"];
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link && link.getAttribute("href") !== href) link.setAttribute("href", href);
}
