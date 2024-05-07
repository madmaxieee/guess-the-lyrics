import AlbumDisplaySkeleton from "@/components/AlbumDisplaySkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistPageLoading() {
  return (
    <div className="mx-auto mb-16 mt-8 w-full max-w-4xl text-xl max-md:mx-1">
      <div className="mb-16 flex justify-between max-md:mb-8 max-md:px-4">
        <Skeleton className="h-12 w-60 max-md:h-8 max-md:w-16" />
        <Button size="sm" disabled className="w-28" />
      </div>
      <div className="flex flex-col gap-8 max-md:gap-4 max-md:px-2">
        {Array.from(Array(3), (_, index) => (
          <AlbumDisplaySkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
