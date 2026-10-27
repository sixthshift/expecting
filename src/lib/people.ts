// The household's people: who's holding each phone. Not accounts: a name and
// which of the two they are.

export type Role = "carrying" | "partner";
export type Person = { id: string; name: string; role: Role };

export const ROLES: Record<Role, string> = {
  carrying: "I'm the one who's pregnant (or will be)",
  partner: "I'm the partner",
};
