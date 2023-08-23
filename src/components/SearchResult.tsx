import Link from "next/link";

import { url2path, splitOnce } from "@/utils/client";
import { type RouterOutput } from "@/utils/routerTypes";

import { Skeleton } from "./ui/skeleton";

type SearchResultProps = {
  result: Exclude<RouterOutput["lyrics"]["search"], null>[number];
};

export default function SearchResult({ result }: SearchResultProps) {
  const [artist, title] = splitOnce(result.title, /\s*-\s*/);
  return (
    <Link href={`/play/${url2path(result.url)}`}>
      <div className="flex w-full justify-between gap-8 rounded-lg p-2 transition-all hover:bg-accent">
        <p className="grow font-bold">{title}</p>
        <p>{artist}</p>
      </div>
    </Link>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex w-full justify-between gap-8 rounded-lg p-2 transition-all hover:bg-accent">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-6 w-40" />
    </div>
  );
}
