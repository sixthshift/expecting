import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useCircleQuery } from "../../../api/rpc/circle";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { type Circle, type CirclePerson, groupsOf, HEARS, toThank, VIEWS, VISITS, type View, viewsOn } from "../../../lib/circle";
import { formatDate } from "../../../lib/dates";
import { extrasOn } from "../../../lib/extras";
import { AddPerson } from "../components/addPerson/AddPerson";
import { Announcement } from "../components/announcement/Announcement";
import { Gifts } from "../components/gifts/Gifts";
import { MealTrain } from "../components/meals/MealTrain";
import { PersonRow } from "../components/person/PersonRow";

const route = getRouteApi("/app/drawer/people");

/** What each view is for, under its name. */
const ABOUT: Record<View, string> = {
  visitors: "Who's welcome in hospital, who in the first weeks home, and who not yet.",
  hearing: "Who hears of the birth first, who next, and who with everyone.",
  help: "Who can help with what in the first weeks, and the meal train.",
  gifts: "Who gave what, ticked off as you thank them.",
};

/**
 * Your people: one list, kept by both of you, and a view of it for each extra
 * that brings one (src/lib/circle.ts). With none on, it says which do. While
 * something has happened it's put away; nothing is deleted.
 */
export function PeoplePage() {
  const { data: circle } = useCircleQuery();
  const { data: on } = useExtrasQuery({ select: extrasOn });
  const { data: quiet } = useQuietQuery();
  const navigate = route.useNavigate();
  const views = viewsOn(on);
  const asked = route.useSearch().view;
  const view = asked && views.includes(asked) ? asked : views[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 md:px-8">
      <Link to="/drawer" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle">
        <ChevronLeft aria-hidden size={16} /> The Drawer
      </Link>
      <h1 className="font-display text-3xl font-semibold text-fg-strong">Your people</h1>
      {quiet ? (
        <p className="mt-2 text-sm text-fg-subtle">Your people are put away while Expecting is quiet. Nothing is deleted.</p>
      ) : !view ? (
        <p className="mt-2 text-sm text-fg-normal">
          Your people comes with Visitors, Birth announcement, Lining up help and Thank-you notes.{" "}
          <Link to="/settings" search={{ ask: `extra:${VIEWS.visitors.extra}` }} className="underline">
            Turn one on in settings
          </Link>
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-5">
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
              options={views.map((v) => ({ value: v, label: label(v, circle) }))}
            />
          ) : null}
          <p className="text-sm text-fg-normal">{ABOUT[view]}</p>
          <ViewBody view={view} circle={circle} />
          <AddPerson />
        </div>
      )}
    </main>
  );
}

/** A view's name, with the gifts still to thank for. */
function label(view: View, circle: Circle): string {
  const left = view === "gifts" ? toThank(circle.gifts).length : 0;
  return left > 0 ? `${VIEWS[view].title} · ${left} to thank` : VIEWS[view].title;
}

function ViewBody({ view, circle }: { view: View; circle: Circle }) {
  const { people, gifts, announcement } = circle;
  if (view === "gifts") return <Gifts people={people} gifts={gifts} />;
  if (view === "help") {
    const meta = (p: CirclePerson) =>
      [p.help, p.mealDay ? `meals ${formatDate(p.mealDay, { weekday: "short", day: "numeric", month: "short" })}` : null].filter(Boolean).join(" · ");
    return (
      <>
        <Grouped
          people={people}
          groups={groupsOf(people, { helping: "Helping" }, (p) => (p.help || p.mealDay ? "helping" : null), "Not asked yet")}
          view={view}
          meta={meta}
        />
        <MealTrain people={people} />
      </>
    );
  }
  return (
    <>
      <Grouped people={people} groups={view === "visitors" ? groupsOf(people, VISITS, (p) => p.visit) : groupsOf(people, HEARS, (p) => p.hears)} view={view} />
      {view === "hearing" ? <Announcement words={announcement} people={people} /> : null}
    </>
  );
}

function Grouped({
  people,
  groups,
  view,
  meta,
}: {
  people: readonly CirclePerson[];
  groups: ReturnType<typeof groupsOf>;
  view: View;
  meta?: (p: CirclePerson) => string;
}) {
  if (people.length === 0) return <p className="text-sm text-fg-subtle">Nobody yet. Add someone below.</p>;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.title} className="flex flex-col">
          <h2 className="text-sm font-semibold text-fg-normal">{g.title}</h2>
          {g.people.map((p) => (
            <PersonRow key={p.id} person={p} view={view} meta={meta?.(p)} />
          ))}
        </section>
      ))}
    </div>
  );
}
