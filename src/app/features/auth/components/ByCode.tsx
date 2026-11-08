import { useSuspenseQuery } from "@tanstack/react-query";
import { codeQuery } from "../../../../api/rpc/session";
import { JOIN_PROBLEMS, RESET_PROBLEMS } from "../model/labels";
import { CodeEntry } from "./CodeEntry";
import { JoinForm } from "./join/JoinForm";
import { ResetForm } from "./reset/ResetForm";

/** What a code is, if it's live: the way to join by an invite, or to choose a new password by a reset; if not, the code again, saying why. */
export function ByCode({ kind, code }: { kind: "join" | "reset"; code: string }) {
  const { data } = useSuspenseQuery(codeQuery(kind, code));
  const problems = kind === "join" ? JOIN_PROBLEMS : RESET_PROBLEMS;
  if (data === "locked") return <CodeEntry to={`/${kind}`} problem={problems.locked} />;
  if (data?.kind === "join") return <JoinForm code={code} role={data.role} by={data.by} />;
  if (data?.kind === "reset") return <ResetForm code={code} name={data.name} />;
  return <CodeEntry to={`/${kind}`} problem={problems.code} />;
}
