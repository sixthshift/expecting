// First, for its side effect: Start reads it as its handler module loads.
import "./server/shellMode";
import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { auth } from "./server/auth/gate";
import { boot } from "./server/core/boot";
import { getDb } from "./server/core/db";

boot();
// Open and migrate before the first request; a broken volume fails the start, not a user.
getDb();
// Read the password hash now: a production server without one refuses to start.
auth();

const fetch: RequestHandler<Register> = createStartHandler(defaultStreamHandler);

export default { fetch };
