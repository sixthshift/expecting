import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi } from "@tanstack/react-router";
import { useCircleQuery } from "../../../api/rpc/circle";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { type View, viewsOn } from "../../../lib/circle";
import { extrasOn } from "../../../lib/extras";
import { DrawerFrame } from "../../drawer/components/frame/DrawerFrame";
import { AddPerson } from "../components/addPerson/AddPerson";
import { ViewBody } from "../components/views/ViewBody";
import { CIRCLE_EXTRAS } from "../model/extras";
import { ABOUT, viewLabel } from "../model/labels";

const route = getRouteApi("/app/drawer/people");

/**
 * Your people: one list, kept by both of you, and a view of it for each extra
 * that brings one (src/lib/circle.ts). With none on, it says which do. While
 * something has happened it's put away; nothing is deleted.
 */
export function CirclePage() {
  const { data: circle } = useCircleQuery();
  const { data: on } = useExtrasQuery({ select: extrasOn });
  const navigate = route.useNavigate();
  const views = viewsOn(on);
  const asked = route.useSearch().view;
  const view = asked && views.includes(asked) ? asked : views[0];

  return (
    <DrawerFrame title="Your people" putAway={{ subject: "Your people", are: true }} extras={CIRCLE_EXTRAS}>
      {view ? (
        <div className="flex flex-col gap-5">
          <p className="text-fg-subtle">The people around you two, and what each of them is doing. Only you two see it.</p>
          {views.length > 1 ? (
            <ToggleGroup
              type="single"
              appearance="separate"
              variant="outline"
              intent="brand"
              aria-label="View"
              className="flex-wrap"
              value={view}
              onValueChange={(v) => (v ? navigate({ search: { view: v as View }, replace: true, resetScroll: false }) : null)}
              options={views.map((v) => ({ value: v, label: viewLabel(v, circle) }))}
            />
          ) : null}
          <p className="text-sm text-fg-normal">{ABOUT[view]}</p>
          <ViewBody view={view} circle={circle} />
          <AddPerson />
        </div>
      ) : null}
    </DrawerFrame>
  );
}
