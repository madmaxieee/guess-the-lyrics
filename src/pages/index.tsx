import { useRef, useState } from "react";

import Head from "next/head";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { url2id } from "@/utils/client";

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
              {results.data.map((result) => {
                const [artist, title] = splitOnce(result.title, /\s*-\s*/);
                return (
                  <li key={result.url}>
                    <Link href={`/play/${url2id(result.url)}`}>
                      <div className="flex w-full justify-between gap-8">
                        <p className="grow font-bold">{title}</p>
                        <p>{artist}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </main>
    </>
  );
}

function splitOnce(s: string, re: RegExp) {
  const match = s.match(re);
  if (!match) {
    return [s];
  }
  const index = match.index ?? s.length;
  return [s.slice(0, index), s.slice(index + match[0].length)];
}
