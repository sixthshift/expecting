// Something has happened: a loss, or hard news that turns everything over.
// While it stands Expecting is quiet for both of you: no countdown,
// no sizes, nothing to do, only support and the next steps when you want
// them. Pure, tested apart from the screen.

/** What has happened: a loss, or news that changes everything but the pregnancy goes on (a worrying result, a baby in intensive care). */
export const QUIET_KINDS = ["loss", "news"] as const;

export type QuietKind = (typeof QUIET_KINDS)[number];

/** Expecting is quiet: why, who said so, and when. */
export type Quiet = { kind: QuietKind; setBy: string | null; setAt: string };

/** The guide that says what this is, and where it can be switched on as well as in Settings. */
export const QUIET_ITEM = "something-has-happened";

/** What each kind is called where you choose it. */
export const QUIET_LABELS: Record<QuietKind, { choose: string; detail: string }> = {
  loss: { choose: "We've lost the baby", detail: "A miscarriage, a stillbirth, or a baby who has died." },
  news: { choose: "We've had hard news", detail: "A worrying result, a baby in intensive care: the pregnancy goes on, but not as it was." },
};

/**
 * Whether `next` may follow what has already happened. Hard news can become a
 * loss; a loss never becomes hard news, and saying the same again changes nothing.
 */
export function canBecome(current: Quiet | null, next: QuietKind): boolean {
  if (current === null) return true;
  return current.kind === "news" && next === "loss";
}

/**
 * What each kind can bring back. Hard news brings the weeks back as they were;
 * a loss can only be undone as a mistake, since there's no pregnancy to resume.
 */
export const WAY_BACK: Record<QuietKind, string> = {
  news: "Bring the weeks back",
  loss: "This was set by mistake",
};
