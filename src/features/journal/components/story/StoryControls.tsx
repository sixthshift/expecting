import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { type StoryView, VIEW_LABEL } from "../../../../lib/story/views";

/**
 * Above the story, one row: the ways to look at it, one at a time (`views`,
 * the one open `view`), and under it the search, which looks through all of
 * it (`words`, `onWords`). Drawn by both stories, the Journal's and the
 * quiet one; what they do is the page's (`useStoryView`, `useStorySearch`).
 */
export function StoryControls({
  views,
  view,
  onView,
  searchable,
  words,
  onWords,
}: {
  views: readonly StoryView[];
  view: StoryView;
  onView: (view: StoryView) => void;
  searchable: boolean;
  words: string;
  onWords: (words: string) => void;
}) {
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
          onValueChange={(value) => onView((value || "days") as StoryView)}
          options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
        />
      ) : null}
      {searchable ? <SearchInput value={words} onValueChange={onWords} placeholder="Look through what's kept" aria-label="Search the Journal" /> : null}
    </div>
  );
}
