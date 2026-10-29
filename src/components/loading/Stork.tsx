import { useId } from "react";

/**
 * A stork flapping across with a bundle swinging from its beak, clouds
 * drifting past. Drawn in the theme's brand colour and accent gradient;
 * animated by `loading.css`.
 */
export function Stork() {
  const id = useId();
  const accent = `${id}-accent`;
  const sky = `${id}-sky`;
  return (
    <svg viewBox="0 0 100 100" className="loading-svg" aria-hidden="true">
      <defs>
        <linearGradient id={accent} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--expecting-accent-from)" />
          <stop offset="1" stopColor="var(--expecting-accent-to)" />
        </linearGradient>
        <clipPath id={sky}>
          <rect width="100" height="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${sky})`}>
        <path className="stork-cloud" fill="var(--bg-brand-subtle)" d="M50 30 a5 5 0 0 1 2 -9 a7 7 0 0 1 13 0 a5 5 0 0 1 1 9 Z" />
        <path className="stork-cloud stork-cloud-later" fill="var(--bg-brand-subtle)" d="M50 80 a5 5 0 0 1 2 -9 a7 7 0 0 1 13 0 a5 5 0 0 1 1 9 Z" />
      </g>
      <g className="stork-glide" fill="none" stroke="var(--fg-brand)" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2.5" d="M32 54 L14 60 M34 55 L18 64" />
        <path fill="var(--expecting-page)" strokeWidth="2.5" d="M28 50 C 30 42, 44 40, 56 44 L 64 46 C 58 54, 44 58, 34 56 Z" />
        <path strokeWidth="3" d="M58 45 C 64 42, 66 34, 70 31" />
        <circle fill="var(--expecting-page)" strokeWidth="2.5" cx="72" cy="30" r="4.5" />
        <path strokeWidth="2.5" d="M76 30 L90 35" />
        <path
          className="stork-wing"
          fill="var(--fg-brand)"
          strokeWidth="1.5"
          d="M44 46 C 42 30, 32 18, 14 15 L 19 21 L 12 23 L 20 27 L 15 31 C 26 37, 34 43, 40 48 Z"
        />
        <g className="stork-bundle">
          <path strokeWidth="1.5" d="M88 35 V46" />
          <path fill="var(--fg-brand)" stroke="none" d="M84 48 L88 44 L92 48 Z" />
          <circle fill={`url(#${accent})`} strokeWidth="2.5" cx="88" cy="56" r="9" />
        </g>
      </g>
    </svg>
  );
}
