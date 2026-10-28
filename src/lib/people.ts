// The household's people: who's holding each phone. Not accounts: a name and
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
