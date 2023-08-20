import { useRef, useState } from "react";

import Head from "next/head";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";

export default function Home() {
  const [query, setQuery] = useState("Taylow Swift all too well 10 min");
  const songData = api.lyrics.fromQuery.useQuery({ query });
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const search = () => {
    const query = searchBoxRef.current?.value;
    if (!query) return;
    setQuery(query);
  };

  return (
    <>
      <Head>
        <title>guess the lyrics</title>
        <meta name="description" content="guess the lyrics game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex max-w-4xl gap-4">
          <Input className="flex-grow" ref={searchBoxRef} />
          <Button variant="outline" onClick={search}>
            search
          </Button>
        </div>
        {songData.data ? (
          <GuessTheLyrics songData={songData.data} />
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </>
  );
}
