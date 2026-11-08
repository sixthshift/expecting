import { Skeleton, SkeletonText } from "../../../../components/loading/Skeleton";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";

/** The entry's card while its words come (seldom seen: the route loads them first): its title, already known, then lines where the words go. */
export function ItemSkeleton({ title }: { title: string }) {
  const { Title } = useLibraryItemPage();
  return (
    <div role="status" aria-label={`Opening ${title}`} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4 desktop:p-6">
      <Skeleton className="h-5 w-32" />
      <Title className="text-2xl font-display font-semibold text-fg-strong">{title}</Title>
      <SkeletonText lines={3} />
      <SkeletonText lines={5} className="mt-2" />
    </div>
  );
}
