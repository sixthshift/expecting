// Where to go once in: pure, so the server (after logging in) and the pages (already in) agree.

/** Where to go after logging in: a same-site path, never another origin. */
export function safeNext(next: string | null | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
