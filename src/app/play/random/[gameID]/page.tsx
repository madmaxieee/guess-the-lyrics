"use client";

import Head from "next/head";
import { useParams } from "next/navigation";

import GuessTheLyrics, {
  GuessTheLyricsSkeleton,
} from "@/components/GuessTheLyrics";
import SEO from "@/components/SEO";
import { api } from "@/trpc/react";

export default function GamePage() {
  const params = useParams();
  const { gameID } = params;

  // const songData = api.mock.songData.useQuery();
  const songData = api.game.getRandom.useQuery({
    randomGameID: gameID as string,
  });

  return (
    <>
      <Head>
        <title>guess the lyrics.</title>
        <SEO />
      </Head>

      {songData.isLoading ? (
        <GuessTheLyricsSkeleton />
      ) : songData.isError ? (
        <div className="mt-[30vh] text-center">
          <h1 className="text-4xl font-bold">Error</h1>
          <p className="text-xl">{songData.error?.message}</p>
        </div>
      ) : songData.data ? (
        <GuessTheLyrics
          songData={songData.data}
          path={songData.data.path}
          hideInfo
        />
      ) : null}
    </>
  );
}
