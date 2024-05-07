import type { TRPCError } from "@trpc/server";

import SearchResult from "@/components/SearchResult";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

type SearchResultsProps = {
  searchMode: "songs" | "artists";
  query: string;
};

export default async function SearchResults({
  searchMode,
  query,
}: SearchResultsProps) {
  if (query === "") {
    return null;
  }
  const search = searchMode === "songs" ? api.lyrics.search : api.artist.search;
  try {
    const results = await search({ query, topN: 10 });
    return (
      <>
        {results.length === 0 ? (
          <p>No results</p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3 max-md:gap-2">
            {results.map((result) => (
              <li key={result.url}>
                <SearchResult variation={searchMode} result={result} />
                <Separator className="mt-3 max-md:mt-1.5" />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  } catch (error) {
    console.error(error);
    return <p>Error: {(error as TRPCError)?.message}</p>;
  }
}
