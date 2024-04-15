import Head from "next/head";

import type { TRPCError } from "@trpc/server";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import SEO from "@/components/SEO";
import { api } from "@/trpc/server";

export default async function GamePage({
  params: { artist, song },
}: {
  params: { artist: string; song: string };
}) {
  const path = `${artist}/${song}`;

  try {
    const songData = await api.lyrics.fromAZpath({ path });
    return (
      <>
        <Head>
          <title>{`guess the lyrics. | ${songData.title ?? ""}`}</title>
          {/* make into server component */}
          <SEO
            title={songData.title}
            artist={songData.artist}
            coverPhotoUrl={songData.coverPhotoURL}
          />
        </Head>
        <GuessTheLyrics songData={songData} path={path} />
      </>
    );
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
