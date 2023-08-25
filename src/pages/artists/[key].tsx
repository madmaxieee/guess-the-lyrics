import React, { useEffect } from "react";

import { Shuffle } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type ArtistData } from "@/server/scrapers/azlyricsParser";
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
        <title>{`guess the lyrics. | ${artistData.data?.name}`}</title>
        <SEO />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <Header />
        <div className="mx-auto mb-16 mt-8 max-w-4xl text-xl">
          {artistData.data ? (
            <>
              <div className="flex justify-between">
                <h1 className="mb-16 text-4xl font-bold">
                  {artistData.data.name}
                </h1>
                <Button
                  onClick={() =>
                    createRandomGame.mutate({ artistKey: artistKey })
                  }
                  disabled={createRandomGame.isLoading}
                >
                  <Shuffle className="mr-2" size="1.25em" /> Random
                </Button>
              </div>
              <div className="flex flex-col gap-8">
                {artistData.data.albums.map((album) => (
                  <React.Fragment key={album.name}>
                    <Separator />
                    <div key={album.name} className="grid grid-cols-5">
                      <div className="col-span-2 flex flex-col items-center gap-6">
                        {album.coverPhotoURL && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.coverPhotoURL}
                            alt={album.name}
                            className="h-48 w-48 rounded-lg"
                          />
                        )}
                        <h2 className="text-2xl font-bold">{album.name}</h2>
                      </div>
                      <div className="col-span-3 flex gap-3">
                        <Button
                          size="icon"
                          variant="secondary"
                          disabled={createRandomGame.isLoading}
                          onClick={() =>
                            createRandomGame.mutate({
                              artistKey,
                              album: album.name,
                            })
                          }
                        >
                          <Shuffle size="1.25em" />
                        </Button>
                        <ul>
                          {album.songs.map((song) => (
                            <AlbumSong song={song} key={song.title} />
                          ))}
                        </ul>
                      </div>
                    </div>
                  </React.Fragment>
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
                          <ul>
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
          ) : null}
        </div>
      </main>
    </>
  );
}

function AlbumSong({
  song: { title, path },
}: {
  song: NonNullable<ArtistData["otherSongs"]>[number];
}) {
  return (
    <Link href={`/play/${path}`} key={title}>
      <li className="mb-1 rounded-lg px-3 py-1.5 transition-all hover:translate-x-2 hover:bg-accent hover:font-bold">
        {title}
      </li>
    </Link>
  );
}
