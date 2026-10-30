// The one shared password, held only as an argon2id hash in the database
// (PasswordRepo), chosen by whoever visits first, unless EXPECTING_LOGIN=off
// turns logins off altogether.

/**
 * Whether the gate asks for the password: EXPECTING_LOGIN is `on` (the
 * default) or `off`. Anything else throws, so a typo is an error rather than
 * a guess at which way it meant. Pure.
 */
export function loginRequired(env: Record<string, string | undefined> = process.env): boolean {
  const value = env.EXPECTING_LOGIN?.trim().toLowerCase() || "on";
  if (value === "on") return true;
  if (value === "off") return false;
  throw new Error(`EXPECTING_LOGIN is "${env.EXPECTING_LOGIN}": set it to on or off.`);
}

export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

/**
 * Failed logins per client, in memory. Ten failures in fifteen minutes locks
 * that client out until the oldest one ages out. A restart forgets, which is
 * fine: the hash is slow to check, and this only has to make guessing tedious.
 */
export class LoginLimiter {
  private readonly failures = new Map<string, number[]>();

  constructor(
    private readonly max = 10,
    private readonly windowMs = 15 * 60_000
  ) {}

  private recent(key: string, now: number): number[] {
    const kept = (this.failures.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (kept.length === 0) this.failures.delete(key);
    else this.failures.set(key, kept);
    return kept;
  }

  locked(key: string, now: number = Date.now()): boolean {
    return this.recent(key, now).length >= this.max;
  }

  fail(key: string, now: number = Date.now()): void {
    this.failures.set(key, [...this.recent(key, now), now]);
  }

  succeed(key: string): void {
    this.failures.delete(key);
  }
}
