import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi } from "@tanstack/react-router";
import { LENS_LABEL, type StoryLens } from "../../../../lib/story/views";

const route = getRouteApi("/app/journal");

/** A way to look at the story: in days (all of it), zoomed out, or one kind. */
type View = StoryLens | "weeks" | "pregnancy";

const VIEW_LABEL: Record<View, string> = { ...LENS_LABEL, all: "Days", weeks: "Weeks", pregnancy: "Whole pregnancy" };

/**
 * Above the story, one row: the ways to look at it, one at a time (in days,
 * zoomed out to weeks or the whole pregnancy with a due date to count them
 * from, or one kind there's something of: `?zoom=`, `?show=`), and the
 * search. Searching looks through all of it, in days: typing leaves a zoom
 * or a lens. The words are held on the page, not in the address: what you
 * look for is yours.
 */
export function StoryControls({
  lenses,
  zoomable,
  searchable,
  words,
  onWords,
}: {
  lenses: readonly StoryLens[];
  zoomable: boolean;
  searchable: boolean;
  words: string;
  onWords: (words: string) => void;
}) {
  const { show, zoom } = route.useSearch();
  const navigate = route.useNavigate();
  const views: View[] = ["all", ...(zoomable ? (["weeks", "pregnancy"] as const) : []), ...lenses.filter((l) => l !== "all")];
  // As the story draws it: a lens over a zoom.
  const view: View = show && lenses.includes(show) ? show : zoomable && zoom ? zoom : "all";
  const open = (next: View) =>
    navigate({
      search: {
        show: next !== "all" && next !== "weeks" && next !== "pregnancy" ? next : undefined,
        zoom: next === "weeks" || next === "pregnancy" ? next : undefined,
      },
    });
  if (views.length <= 1 && !searchable) return null;
  return (
    <div className="flex flex-col gap-3">
      {views.length > 1 ? (
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="outline"
          size="sm"
          aria-label="Show"
          className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
          value={view}
          onValueChange={(value) => open((value || "all") as View)}
          options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
        />
      ) : null}
      {searchable ? (
        <SearchInput
          value={words}
          onValueChange={(next) => {
            onWords(next);
            if (next.trim() && view !== "all") open("all");
          }}
          placeholder="Look through what's kept"
          aria-label="Search the Journal"
        />
      ) : null}
    </div>
  );
}
