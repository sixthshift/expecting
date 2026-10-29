// Australian phone numbers in running text, so a body's "call PANDA on
// 1300 726 306" is a number you can tap. Only the shapes services use: triple
// zero, 13 numbers, and 1300 and 1800 numbers, spaced however they're written.

/** 000; 13 11 14; 1300 726 306; 1300 78 99 78; 1800 882 436. Not the 000 in "10,000". */
const PHONE = /(?<![\d,.])(?:000|1[38]00(?: ?\d){6}|13(?: ?\d){4})(?!\d|,\d)/g;

export type TextPart = string | { phone: string };

/** Text cut into plain runs and the numbers in it, in order. */
export function splitPhones(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(PHONE)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ phone: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
