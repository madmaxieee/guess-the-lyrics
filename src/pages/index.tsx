import { useRef, useState } from "react";

import Head from "next/head";

import SearchResult from "@/components/SearchResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const results = api.lyrics.search.useQuery({ query });

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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex gap-4">
          <Input className="flex-grow" ref={searchBoxRef} onKeyUp={onEnter} />
          <Button variant="outline" onClick={search}>
            search
          </Button>
        </div>
        <div className="mt-8 max-w-4xl text-xl">
          {results.isLoading ? (
            <p>Loading...</p>
          ) : results.isError ? (
            <p>Error: {results.error.message}</p>
          ) : results.data ? (
            <ul className="flex flex-col gap-4">
              {results.data.map((result) => (
                <li key={result.url}>
                  <SearchResult result={result} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </>
  );
}
