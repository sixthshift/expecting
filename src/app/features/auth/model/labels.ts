// The words the login, joining and a new password share.

/** Locked out for a while, after too many wrong passwords or codes. */
export const LOCKED = "Too many tries. Wait a few minutes, then try again.";

/** Why joining by an invite didn't go ahead. */
export const JOIN_PROBLEMS = {
  code: "That code isn't live: it's been used, or it's more than a week old. Ask for a new one.",
  locked: LOCKED,
  full: "There are two of you already.",
  password: "Choose a password.",
} as const;

/** Why a new password by a reset link didn't go ahead. */
export const RESET_PROBLEMS = {
  code: "That code isn't live: it's been used, or it's more than a day old. Ask for a new one.",
  locked: LOCKED,
} as const;
