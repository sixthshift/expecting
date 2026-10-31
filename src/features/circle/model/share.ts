// Handing words to another app: the share sheet where the phone has one, else
// the clipboard. Expecting sends nothing itself.

/** What happened: shared, copied, or neither (cancelled, or not allowed). */
export type Handed = "shared" | "copied" | "no";

export async function handOff(text: string): Promise<Handed> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      // Cancelled, or refused: fall through to the clipboard only when sharing isn't allowed at all.
      return "no";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "no";
  }
}
