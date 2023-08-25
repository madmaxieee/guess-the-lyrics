import Link from "next/link";

import { artisturl2key, songurl2path } from "@/utils/client";
import { type RouterOutput } from "@/utils/routerTypes";

import { Skeleton } from "./ui/skeleton";

type SearchResultProps = {
  result: Exclude<RouterOutput["lyrics"]["search"], null>[number];
  variation: "songs" | "artists";
};

export default function SearchResult({ result, variation }: SearchResultProps) {
  let artist;
  let title;
  if (variation === "artists") {
    artist = result.title;
    title = "";
  } else {
    [artist, title] = searchResult2artistTitle(result);
  }

  return (
    <Link
      href={
        variation === "artists"
          ? `/artists/${artisturl2key(result.url)}`
          : `/play/${songurl2path(result.url)}`
      }
    >
      <div className="flex w-full justify-between rounded-lg p-2 transition-all hover:bg-accent max-md:p-1.5 max-md:text-sm">
        <p className="grow font-bold">{title}</p>
        <p>{artist}</p>
      </div>
    </Link>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex w-full justify-between rounded-lg p-1 transition-all hover:bg-accent">
      <Skeleton className="h-8 w-28 max-md:h-5" />
      <Skeleton className="h-8 w-40 max-md:h-5" />
    </div>
  );
}

function searchResult2artistTitle(result: SearchResultProps["result"]) {
  if (/\s+-\s+/.test(result.title)) {
    return splitOnce(result.title, /\s+-\s+/);
  } else {
    return ["", result.title];
  }
}

function splitOnce(s: string, re: RegExp): [string, string] {
  const match = s.match(re);
  if (!match) {
    return [s, ""];
  }
  const index = match.index ?? s.length;
  return [s.slice(0, index), s.slice(index + match[0].length)];
}
