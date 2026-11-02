// The people: the two of you, each an account (logged in as, with your own
// password), each with a name and which of the two you are.

export type Role = "carrying" | "partner";

/** Whose job a task is: one of the two, or both of you. */
export type Who = Role | "together";
export type Person = { id: string; name: string; role: Role };

export const ROLES: Record<Role, string> = {
  carrying: "I'm the one who's pregnant (or will be)",
  partner: "I'm the partner",
};

/** A role's name before anyone holds it: "the pregnant parent", "the partner". */
export const ROLE_NAMES: Record<Role, string> = {
  carrying: "the pregnant parent",
  partner: "the partner",
};

/** The other of the two. */
export function otherRole(role: Role): Role {
  return role === "carrying" ? "partner" : "carrying";
}

/**
 * Whose a task is, as the person holding this phone reads it: "Yours", "Sam's",
 * or "Together". With nobody yet in a role, the role names it.
 */
export function whose(who: Who, me: Person | null, people: readonly Person[]): string {
  if (who === "together") return "Together";
  if (me?.role === who) return "Yours";
  const them = people.find((p) => p.role === who);
  if (them) return `${them.name}'s`;
  return `${capitalise(ROLE_NAMES[who])}'s`;
}

/**
 * Whose something one of you added is, by who added it, as the person holding
 * this phone reads it: "Yours" or "Sam's". Null for nobody (from before it was
 * kept, a phone that hadn't said, or a person since forgotten).
 */
export function whoseBy(by: string | null, me: Person | null, people: readonly Person[]): string | null {
  if (by === null) return null;
  if (me?.id === by) return "Yours";
  const them = people.find((p) => p.id === by);
  return them ? `${them.name}'s` : null;
}

/** What the other of the two is called before they've joined. */
export const OTHER_ONE = "The other one";

/** The other of the two, as the person holding this phone sees it: null before they've joined. */
export function otherOf(people: readonly Person[], me: Person | null): Person | null {
  return people.find((p) => p.id !== me?.id) ?? null;
}

/** The other one's name, or "The other one" before they've joined. */
export function otherName(people: readonly Person[], me: Person | null): string {
  return otherOf(people, me)?.name ?? OTHER_ONE;
}

/**
 * Who one of you is, by their id, as the person holding this phone reads it:
 * "You" (or `you`, mid-sentence) or their name. Null for nobody (from before
 * it was kept, or a person since forgotten).
 */
export function nameBy(by: string | null, me: Person | null, people: readonly Person[], you = "You"): string | null {
  if (by === null) return null;
  if (me?.id === by) return you;
  return people.find((p) => p.id === by)?.name ?? null;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
