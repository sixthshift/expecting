import { createMiddleware } from "@tanstack/react-start";
import { isOpenFunction } from "../auth/gate";
import { refusePrivate } from "./guard";

/**
 * Every server function's input, as sent, is turned away if it names a private entry. Not the
 * session's (choosing the password, logging in): a password is kept only as a hash, and must never be refused.
 */
export const privateFunctionMiddleware = createMiddleware({ type: "function" }).server(({ data, serverFnMeta, next }) => {
  const refused = isOpenFunction(serverFnMeta.filename) ? null : refusePrivate(data);
  if (refused) throw refused;
  return next();
});
