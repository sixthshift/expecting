// First, for its side effect: Start reads it as its handler module loads.
import "./server/shellMode";
import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { loginOn } from "./server/auth/gate";
import { boot } from "./server/core/boot";
import { getDb } from "./server/core/db";

boot();
// Open and migrate before the first request; a broken volume fails the start, not a user.
getDb();
// Read EXPECTING_LOGIN here too: a value that is neither on nor off throws.
// Nitro loads this module on the first request, not at listen, so that request
// is a 500 with the reason in the log, and the healthcheck goes unhealthy.
loginOn();

const fetch: RequestHandler<Register> = createStartHandler(defaultStreamHandler);

export default { fetch };
