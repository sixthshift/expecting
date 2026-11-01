/**
 * "Kept by Sam", "Kept by you": who held the phone, said so it can't be read
 * as whose it is. Sickness, cravings, movements and photos are about her
 * body or the baby, whoever keeps them, so they never just say a name.
 */
export function keptBy(name: string | null): string | null {
  if (name === null) return null;
  return `Kept by ${name === "You" ? "you" : name}`;
}
