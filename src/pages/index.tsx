import { useRef, useState } from "react";

import Head from "next/head";

import Header from "@/components/Header";
import SearchResult, { SearchResultSkeleton } from "@/components/SearchResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/api";

const RESULT_LIMIT = 8;

export default function Home() {
  const [query, setQuery] = useState("");
  const results = api.lyrics.search.useQuery({ query, topN: 8 });
  // const results = api.mock.searchResults.useQuery({ query, topN: 8 });

  const searchBoxRef = useRef<HTMLInputElement>(null);

  const search = () => {
    const query = searchBoxRef.current?.value;
    if (!query) return;
    setQuery(query);
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search();
    }
  };

  return (
    <>
      <Head>
        <title>guess the lyrics</title>
        <meta name="description" content="guess the lyrics game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-full min-h-screen flex-col items-center">
        <Header />
        <div className="mx-auto mt-8 max-w-4xl text-xl">
          <div className="my-6 flex justify-center gap-4">
            <Input className="w-72" ref={searchBoxRef} onKeyUp={onEnter} />
            <Button variant="outline" onClick={search}>
              search
            </Button>
          </div>
          {results.isLoading ? (
            <ul className="mx-auto flex max-w-2xl flex-col gap-3">
              {Array.from(Array(RESULT_LIMIT), (_, index) => (
                <li key={index}>
                  <SearchResultSkeleton />
                  <Separator className="mt-3" />
                </li>
              ))}
            </ul>
          ) : results.isError ? (
            <p>Error: {results.error.message}</p>
          ) : results.data?.length === 0 ? (
            <p>No results</p>
          ) : results.data ? (
            <ul className="mx-auto flex max-w-2xl flex-col gap-3">
              {results.data.map((result) => (
                <li key={result.url}>
                  <SearchResult result={result} />
                  <Separator className="mt-3" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </>
  );
}
