import Link from "next/link";

import { url2id, splitOnce } from "@/utils/client";
import { type RouterOutput } from "@/utils/routerTypes";

type SearchResultProps = {
  result: RouterOutput["lyrics"]["search"][number];
};

export default function SearchResult({ result }: SearchResultProps) {
  const [artist, title] = splitOnce(result.title, /\s*-\s*/);
  return (
    <Link href={`/play/${url2id(result.url)}`}>
      <div className="flex w-full justify-between gap-8">
        <p className="grow font-bold">{title}</p>
        <p>{artist}</p>
      </div>
    </Link>
  );
}
