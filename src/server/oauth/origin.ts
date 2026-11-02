// Where Expecting is reached from outside, for the addresses OAuth hands out:
// EXPECTING_URL when it is set (https://expecting.example.ts.net), else what
// the proxy in front says, else the request's own.

/** The public origin, no trailing slash. */
export function publicOrigin(request: Request, env: Record<string, string | undefined> = process.env): string {
  const set = env.EXPECTING_URL?.trim();
  if (set) return new URL(set).origin;
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return `${proto || url.protocol.replace(":", "")}://${host || url.host}`;
}
