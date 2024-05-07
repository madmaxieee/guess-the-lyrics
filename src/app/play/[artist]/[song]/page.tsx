import { cache } from "react";

import type { TRPCError } from "@trpc/server";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import { api } from "@/trpc/server";
import { makeMetadata } from "@/utils/metadata";

const getSongData = cache(async (path: string) => {
  const songData = await api.lyrics.fromAZpath({ path });
  return songData;
});

export async function generateMetadata({
  params: { artist, song },
}: {
  params: { artist: string; song: string };
}) {
  const songData = await getSongData(`${artist}/${song}`);
  return makeMetadata({
    songName: songData.title,
    artistName: songData.artist,
  });
}

export default async function GamePage({
  params: { artist, song },
}: {
  params: { artist: string; song: string };
}) {
  const path = `${artist}/${song}`;
  try {
    const songData = await getSongData(path);
    return <GuessTheLyrics songData={songData} path={path} />;
  } catch (error) {
    console.error(error);
    return (
      <div className="mt-[30vh] text-center">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="text-xl">{(error as TRPCError)?.message}</p>
      </div>
    );
  }
}
