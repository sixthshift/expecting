import { getRouteApi } from "@tanstack/react-router";
import { Alone } from "../../../../components/Alone";
import { ByCode } from "../components/ByCode";
import { CodeEntry } from "../components/CodeEntry";

const route = getRouteApi("/reset");

/** A new password, by the link the other of you made: every phone of yours logs out, and this one in. */
export function ResetPage() {
  const { code } = route.useSearch();
  return (
    <Alone title="A new password" subtitle={code ? undefined : "The code from the link you were sent."}>
      {code ? <ByCode kind="reset" code={code} /> : <CodeEntry to="/reset" />}
    </Alone>
  );
}
