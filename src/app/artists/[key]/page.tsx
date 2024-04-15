import React from "react";

import Head from "next/head";
import { redirect } from "next/navigation";

import type { TRPCError } from "@trpc/server";

import AlbumDisplay, { AlbumSong } from "@/components/AlbumDisplay";
import SEO from "@/components/SEO";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import RandomButton from "./_components/RandomButton";

export default async function ArtistPage({
  params: { key },
}: {
  params: { key: string };
}) {
  const createRandomGame = async () => {
    "use server";
    const { randomGameID } = await api.game.createRandom({
      artistKey: key,
    });
    redirect(`/play/random/${randomGameID}`);
  };

  try {
    const artistData = await api.artist.fromAZkey({ key });

    return (
      <>
        <Head>
          <title>{`guess the lyrics. | ${artistData.name ?? ""}`}</title>
          <SEO />
        </Head>
        <div className="mx-auto mb-16 mt-8 w-full max-w-4xl text-xl max-md:mx-1">
          <div className="mb-16 flex justify-between max-md:mb-8 max-md:px-4">
            <h1 className="text-4xl font-bold max-md:text-3xl">
              {artistData.name}
            </h1>
            <RandomButton createRandomGame={createRandomGame} />
          </div>
          <div className="flex flex-col gap-8 max-md:gap-4 max-md:px-2">
            {artistData.albums.map((album) => (
              <AlbumDisplay key={album.name} album={album} artistKey={key} />
            ))}
            {artistData.otherSongs && artistData.otherSongs.length > 0 && (
              <>
                <Separator />
                <div className="grid grid-cols-5">
                  <div className="col-span-2 flex flex-col items-center gap-6">
                    <h2 className="text-2xl font-bold">other songs:</h2>
                  </div>
                  <div className="col-span-3 flex gap-3">
                    <ul className="grow">
                      {artistData.otherSongs.map((song) => (
                        <AlbumSong song={song} key={song.title} />
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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
