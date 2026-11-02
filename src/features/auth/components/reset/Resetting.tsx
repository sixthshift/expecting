import { useSuspenseQuery } from "@tanstack/react-query";
import { codeQuery } from "../../../../api/rpc/session";
import { RESET_PROBLEMS } from "../../model/labels";
import { CodeEntry } from "../CodeEntry";
import { ResetForm } from "./ResetForm";

/** The reset a code is, if it's live: then the way to choose a new password by it. */
export function Resetting({ code }: { code: string }) {
  const { data: reset } = useSuspenseQuery(codeQuery("reset", code));
  if (reset === "locked") return <CodeEntry to="/reset" problem={RESET_PROBLEMS.locked} />;
  if (reset?.kind !== "reset") return <CodeEntry to="/reset" problem={RESET_PROBLEMS.code} />;
  return <ResetForm code={code} name={reset.name} />;
}
