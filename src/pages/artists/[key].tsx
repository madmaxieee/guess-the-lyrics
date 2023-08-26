import React, { useEffect } from "react";

import { Shuffle } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";

import AlbumDisplay, {
  AlbumDisplaySkeleton,
  AlbumSong,
} from "@/components/AlbumDisplay";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";

export default function ArtistPage() {
  const router = useRouter();
  const artistKey = router.query.key as string;
  const artistData = api.artist.fromAZkey.useQuery({ key: artistKey });
  // const artistData = api.mock.artistData.useQuery();

  const createRandomGame = api.game.createRandom.useMutation();

  useEffect(() => {
    if (createRandomGame.isSuccess) {
      router
        .push(`/play/random/${createRandomGame.data.randomGameID}`)
        .catch(console.error);
    }
  }, [createRandomGame.data?.randomGameID, createRandomGame.isSuccess, router]);

  return (
    <>
      <Head>
        <title>{`guess the lyrics. | ${artistData.data?.name ?? ""}`}</title>
        <SEO />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <Header />
        <div className="mx-auto mb-16 mt-8 w-full max-w-4xl text-xl max-md:mx-1">
          {artistData.isLoading ? (
            <>
              <div className="mb-16 flex justify-between max-md:mb-8 max-md:px-4">
                <Skeleton className="h-12 w-60 max-md:h-8 max-md:w-16" />
                <Button size="sm" disabled className="w-28" />
              </div>
              <div className="flex flex-col gap-8 max-md:gap-4 max-md:px-2">
                {Array.from(Array(3), (_, index) => (
                  <AlbumDisplaySkeleton key={index} />
                ))}
              </div>
            </>
          ) : artistData.data ? (
            <>
              <div className="mb-16 flex justify-between max-md:mb-8 max-md:px-4">
                <h1 className="text-4xl font-bold max-md:text-3xl">
                  {artistData.data.name}
                </h1>
                <Button
                  onClick={() =>
                    createRandomGame.mutate({ artistKey: artistKey })
                  }
                  size="sm"
                  disabled={createRandomGame.isLoading}
                >
                  <Shuffle className="mr-2" size="1.25em" /> Random
                </Button>
              </div>
              <div className="flex flex-col gap-8 max-md:gap-4 max-md:px-2">
                {artistData.data.albums.map((album) => (
                  <AlbumDisplay
                    key={album.name}
                    album={album}
                    artistKey={artistKey}
                  />
                ))}
                {artistData.data?.otherSongs &&
                  artistData.data?.otherSongs.length > 0 && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-5">
                        <div className="col-span-2 flex flex-col items-center gap-6">
                          <h2 className="text-2xl font-bold">other songs:</h2>
                        </div>
                        <div className="col-span-3 flex gap-3">
                          <ul className="grow">
                            {artistData.data.otherSongs.map((song) => (
                              <AlbumSong song={song} key={song.title} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </>
          ) : artistData.isError ? (
            <div className="mt-[30vh] text-center">
              <h1 className="text-4xl font-bold">Error</h1>
              <p className="text-xl">{artistData.error?.message}</p>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
