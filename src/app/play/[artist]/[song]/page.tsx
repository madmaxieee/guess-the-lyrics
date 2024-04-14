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
  const { artist, song } = params;
  const path = artist && song ? `${artist as string}/${song as string}` : null;
  const songData = api.lyrics.fromAZpath.useQuery({ path });
  // const songData = api.mock.songData.useQuery();

  return (
    <>
      <Head>
        <title>{`guess the lyrics. | ${songData.data?.title ?? ""}`}</title>
        {/* make into server component */}
        <SEO
          title={songData.data?.title}
          artist={songData.data?.artist}
          coverPhotoUrl={songData.data?.coverPhotoURL}
        />
      </Head>

      {songData.isLoading ? (
        <GuessTheLyricsSkeleton />
      ) : songData.isError ? (
        <div className="mt-[30vh] text-center">
          <h1 className="text-4xl font-bold">Error</h1>
          <p className="text-xl">{songData.error?.message}</p>
        </div>
      ) : songData.data && path ? (
        <GuessTheLyrics songData={songData.data} path={path} />
      ) : null}
    </>
  );
}
