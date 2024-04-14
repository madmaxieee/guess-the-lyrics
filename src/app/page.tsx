"use client";

import { useEffect, useRef, useState } from "react";

import Head from "next/head";
import Image from "next/image";

import bannerImage from "@/assets/banner.svg";
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
import { api } from "@/trpc/react";

const RESULT_LIMIT = 8;

export default function Home() {
  const [searchMode, setSearchMode] = useState<"songs" | "artists">("songs");
  const searchSongs = api.lyrics.search.useMutation();
  const searchArtists = api.artist.search.useMutation();
  const searchMutation = searchMode === "songs" ? searchSongs : searchArtists;

  const searchBoxRef = useRef<HTMLInputElement>(null);

  const search = () => {
    if (searchMutation.isPending) {
      return;
    }
    const query = searchBoxRef.current?.value;
    if (query) {
      searchMutation.mutate({ query, topN: RESULT_LIMIT });

      if (searchMutation.isIdle) {
        searchMutation.mutate({
          query,
          topN: RESULT_LIMIT,
        });
      }
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search();
    }
  };

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, []);

  return (
    <>
      <Head>
        <SEO />
      </Head>
      <Image
        priority
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={bannerImage}
        className="mx-auto mt-8 max-w-4xl max-sm:w-full"
        alt="Are you a real fan? guess the lyrics!"
      />
      <div className="mx-auto my-8 w-full max-w-4xl text-xl max-md:px-6">
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
          <Input
            className="grow md:w-72 md:grow-0"
            ref={searchBoxRef}
            onKeyUp={onEnter}
          />
          <Button
            disabled={
              searchMutation.isPending || searchBoxRef.current?.value === ""
            }
            onClick={search}
          >
            search
          </Button>
        </div>
        {searchMutation.isPending ? (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3 max-md:gap-2">
            {Array.from(Array(RESULT_LIMIT), (_, index) => (
              <li key={index}>
                <SearchResultSkeleton />
                <Separator className="mt-3 max-md:mt-1.5" />
              </li>
            ))}
          </ul>
        ) : searchMutation.isError ? (
          <p>Error: {searchMutation.error.message}</p>
        ) : searchMutation.data?.length === 0 ? (
          <p>No results</p>
        ) : searchMutation.data ? (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3 max-md:gap-2">
            {searchMutation.data.map((result) => (
              <li key={result.url}>
                <SearchResult variation={searchMode} result={result} />
                <Separator className="mt-3 max-md:mt-1.5" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
