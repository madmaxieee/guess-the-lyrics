import React from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Separator } from "@/components/ui/separator";
import { ArtistData } from "@/server/scrapers/azlyricsParser";
import { api } from "@/utils/api";
import { RouterOutput } from "@/utils/routerTypes";

export default function ArtistPage() {
  const router = useRouter();
  const artistKey = router.query.key as string;
  // const artistData = api.artist.fromAZkey.useQuery({ key: artistKey });
  const artistData = api.mock.artistData.useQuery();

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
              <h1 className="mb-16 text-4xl font-bold">
                {artistData.data.name}
              </h1>
              <div className="flex flex-col gap-8">
                {artistData.data.albums.map((album) => (
                  <React.Fragment key={album.name}>
                    <Separator />
                    <div key={album.name} className="grid grid-cols-2">
                      <div className="flex flex-col items-center gap-6">
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
                      <ul>
                        {album.songs.map((song) => (
                          <AlbumSong song={song} key={song.title} />
                        ))}
                      </ul>
                    </div>
                  </React.Fragment>
                ))}
                {artistData.data?.otherSongs &&
                  artistData.data?.otherSongs.length > 0 && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2">
                        <div className="flex flex-col items-center gap-6">
                          <h2 className="text-2xl font-bold">other songs:</h2>
                        </div>
                        <ul>
                          {artistData.data.otherSongs.map((song) => (
                            <AlbumSong song={song} key={song.title} />
                          ))}
                        </ul>
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
