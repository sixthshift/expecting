// The one shared password, held only as a hash in EXPECTING_PASSWORD_HASH
// (`bun run password` makes one).

export type AuthMode = { enabled: true; hash: string } | { enabled: false };

/**
 * Whether logins are required. Without a hash the dev server runs open, with
 * a warning; a production server refuses to start, so a forgotten variable
 * fails the deploy rather than exposing the data.
 */
export function authMode(env: Record<string, string | undefined> = process.env, production = import.meta.env.PROD): AuthMode {
  const hash = env.EXPECTING_PASSWORD_HASH?.trim();
  if (hash) {
    if (!hash.startsWith("$argon2") && !hash.startsWith("$2"))
      throw new Error("EXPECTING_PASSWORD_HASH is not a password hash. Make one with `bun run password`.");
    return { enabled: true, hash };
  }
  if (production) throw new Error("EXPECTING_PASSWORD_HASH is not set. Make one with `bun run password` and set it in the environment.");
  return { enabled: false };
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
