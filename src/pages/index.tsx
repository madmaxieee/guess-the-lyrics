import { useEffect, useRef, useState } from "react";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import banner from "@/assets/banner.svg";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import SearchResult, { SearchResultSkeleton } from "@/components/SearchResult";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/api";

const RESULT_LIMIT = 8;

export default function Home() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"songs" | "artists">("songs");
  const searchSongs = api.lyrics.search.useMutation();
  const searchArtists = api.artist.search.useMutation();
  const searchMutation = searchMode === "songs" ? searchSongs : searchArtists;

  const searchBoxRef = useRef<HTMLInputElement>(null);

  const search = () => {
    if (searchMutation.isLoading) {
      return;
    }
    const query = searchBoxRef.current?.value;
    if (query) {
      searchMutation.mutate({ query, topN: RESULT_LIMIT });
      router.push(`/?q=${query}`).catch(console.error);
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search();
    }
  };

  useEffect(() => {
    if (router.query.q && searchBoxRef.current) {
      searchBoxRef.current.value = router.query.q as string;
      if (searchMutation.isIdle) {
        searchMutation.mutate({
          query: router.query.q as string,
          topN: RESULT_LIMIT,
        });
      }
    }
  }, [router.query.q, searchMutation]);

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, []);

  return (
    <>
      <Head>
        <title>guess the lyrics.</title>
        <SEO />
      </Head>
      <main className="h-full min-h-screen flex-col items-center">
        <Header />
        <Image
          priority
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          src={banner}
          className="mx-auto mt-8 max-w-4xl"
          alt="Are you a real fan? guess the lyrics!"
        />
        <div className="mx-auto mt-8 max-w-4xl text-xl">
          <div className="my-6 flex justify-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-16">
                  {searchMode}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => setSearchMode("songs")}>
                  songs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchMode("artists")}>
                  artists
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input className="w-72" ref={searchBoxRef} onKeyUp={onEnter} />
            <Button
              disabled={
                searchMutation.isLoading || searchBoxRef.current?.value === ""
              }
              onClick={search}
            >
              search
            </Button>
          </div>
          {searchMutation.isLoading ? (
            <ul className="mx-auto flex max-w-2xl flex-col gap-3">
              {Array.from(Array(RESULT_LIMIT), (_, index) => (
                <li key={index}>
                  <SearchResultSkeleton />
                  <Separator className="mt-3" />
                </li>
              ))}
            </ul>
          ) : searchMutation.isError ? (
            <p>Error: {searchMutation.error.message}</p>
          ) : searchMutation.data?.length === 0 ? (
            <p>No results</p>
          ) : searchMutation.data ? (
            <ul className="mx-auto flex max-w-2xl flex-col gap-3">
              {searchMutation.data.map((result) => (
                <li key={result.url}>
                  <SearchResult variation={searchMode} result={result} />
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
