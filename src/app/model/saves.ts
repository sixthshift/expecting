// Every save the outbox (./outbox.ts) can hold, each defined beside its server
// function. A save made offline is sent by the build that opens next, so this
// list is how that build knows it: a new save goes here.

import { appetiteSaves } from "../../api/rpc/appetite";
import { checklistSaves } from "../../api/rpc/checklist";
import { emergencySaves } from "../../api/rpc/emergency";
import { extrasSaves } from "../../api/rpc/extras";
import { factsSaves } from "../../api/rpc/facts";
import { feelingsSaves } from "../../api/rpc/feelings";
import { firstsSaves } from "../../api/rpc/firsts";
import { itsTimeSaves } from "../../api/rpc/itsTime";
import { journalSaves, journalSeenSaves } from "../../api/rpc/journal";
import { listsSaves } from "../../api/rpc/lists";
import { namesSaves } from "../../api/rpc/names";
import { papersSaves } from "../../api/rpc/papers";
import { photosSaves } from "../../api/rpc/photos";
import { questionsSaves } from "../../api/rpc/questions";
import { quietSaves } from "../../api/rpc/quiet";
import { settingsSaves } from "../../api/rpc/settings";
import type { Save } from "../../lib/outbox";

// biome-ignore lint/suspicious/noExplicitAny: each save's own types are checked where it is defined; here they are only passed through.
export type AnySave = Save<any, any>;

export const SAVES: readonly AnySave[] = [
  checklistSaves,
  questionsSaves,
  namesSaves,
  factsSaves,
  extrasSaves,
  settingsSaves,
  emergencySaves,
  quietSaves,
  journalSaves,
  journalSeenSaves,
  firstsSaves,
  feelingsSaves,
  appetiteSaves,
  photosSaves,
  papersSaves,
  listsSaves,
  itsTimeSaves,
].flatMap((saves) => Object.values(saves));
