// The people: who's holding each phone. Not accounts: a name and
// which of the two they are.

export type Role = "carrying" | "partner";

/** Whose job a task is: one of the two, or both of you. */
export type Who = Role | "together";
export type Person = { id: string; name: string; role: Role };

export const ROLES: Record<Role, string> = {
  carrying: "I'm the one who's pregnant (or will be)",
  partner: "I'm the partner",
};

/**
 * Whose a task is, as the person holding this phone reads it: "Yours", "Sam's",
 * or "Together". With nobody yet in a role, the role names it.
 */
export function whose(who: Who, me: Person | null, people: readonly Person[]): string {
  if (who === "together") return "Together";
  if (me?.role === who) return "Yours";
  const them = people.find((p) => p.role === who);
  if (them) return `${them.name}'s`;
  return who === "partner" ? "The partner's" : "The birth parent's";
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
