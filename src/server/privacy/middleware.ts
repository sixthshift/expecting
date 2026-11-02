import { createMiddleware } from "@tanstack/react-start";
import { isOpenFunction } from "../auth/gate";
import { refusePrivate } from "./guard";

/** The fields that hold a password: kept only as a hash, so never a trace, and never refused. */
const PASSWORDS = new Set(["password", "current"]);

/** `data` without its passwords, to check what's left. */
function withoutPasswords(data: unknown): unknown {
  if (data === null || typeof data !== "object" || Array.isArray(data) || data instanceof FormData) return data;
  return Object.fromEntries(Object.entries(data).filter(([key]) => !PASSWORDS.has(key)));
}

/**
 * Every server function's input, as sent, is turned away if it names a private entry. Not the
 * session's (setting up, logging in, joining), nor a password anywhere (changing yours): a
 * password is kept only as a hash, and must never be refused.
 */
export const privateFunctionMiddleware = createMiddleware({ type: "function" }).server(({ data, serverFnMeta, next }) => {
  const refused = isOpenFunction(serverFnMeta.filename) ? null : refusePrivate(withoutPasswords(data));
  if (refused) throw refused;
  return next();
});
