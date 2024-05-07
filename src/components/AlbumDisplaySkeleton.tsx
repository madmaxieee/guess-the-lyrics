import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

export default function AlbumDisplaySkeleton() {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-5">
        <div className="col-span-2 flex flex-col items-center gap-6 max-md:ml-1.5 max-md:items-start max-md:gap-3">
          <Skeleton className="h-48 w-48 rounded-lg max-md:h-32 max-md:w-32 max-md:rounded-md" />
          <Skeleton className="h-8 w-60 max-md:h-6 max-md:w-32" />
          <Button
            size="icon"
            className="hidden max-md:inline-flex"
            variant="secondary"
            disabled
          ></Button>
        </div>

        <div className="col-span-3 flex gap-3">
          <Button
            size="icon"
            className="hidden md:inline-flex"
            variant="secondary"
            disabled
          ></Button>
          <ul className="grow">
            {Array.from(Array(6), (_, index) => (
              <AlbumSongSkeleton key={index} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export function AlbumSongSkeleton() {
  return (
    <li className="rounded-lg px-3 py-1.5 max-md:py-1 max-md:text-sm">
      <Skeleton className="h-8 w-full" />
    </li>
  );
}
