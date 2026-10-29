// The names game, as one person sees it: every name, their own vote on each,
// and the matches (names everyone in the household likes). Never anyone
// else's votes.

/** A name, with this person's own vote: liked, passed, or not yet. */
export type NameCard = { id: string; name: string; mine: boolean | null };

export type NamesView = {
  names: NameCard[];
  /** Names both of you like, in the order they were added. */
  matches: { id: string; name: string }[];
  /** Whether there's someone to match with yet. */
  together: boolean;
};

/** A name as typed, tidied: trimmed, single-spaced, and each word capitalised if it was typed in lower case. */
export function tidyName(typed: string): string {
  const name = typed.trim().replace(/\s+/g, " ");
  return name === name.toLowerCase() ? name.replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase()) : name;
}

/** The next name for this person to vote on: the oldest they haven't. */
export function nextToVote(view: NamesView): NameCard | undefined {
  return view.names.find((n) => n.mine === null);
}
