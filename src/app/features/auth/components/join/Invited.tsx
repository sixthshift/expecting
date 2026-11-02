import { useSuspenseQuery } from "@tanstack/react-query";
import { codeQuery } from "../../../../../api/rpc/session";
import { JOIN_PROBLEMS } from "../../model/labels";
import { CodeEntry } from "../CodeEntry";
import { JoinForm } from "./JoinForm";

/** The invite a code is, if it's live: then the way to join by it. */
export function Invited({ code }: { code: string }) {
  const { data: invite } = useSuspenseQuery(codeQuery("join", code));
  if (invite === "locked") return <CodeEntry to="/join" problem={JOIN_PROBLEMS.locked} />;
  if (invite?.kind !== "join") return <CodeEntry to="/join" problem={JOIN_PROBLEMS.code} />;
  return <JoinForm code={code} role={invite.role} by={invite.by} />;
}
