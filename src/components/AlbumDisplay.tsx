"use client";

import React, { useEffect } from "react";

import { Shuffle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { type ArtistData } from "@/server/scrapers/azlyricsParser";
import { api } from "@/trpc/react";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type AlbumDisplayProps = {
  album: NonNullable<ArtistData>["albums"][number];
  artistKey: string;
};

export default function AlbumDisplay({ album, artistKey }: AlbumDisplayProps) {
  const createRandomGame = api.game.createRandom.useMutation();
  const router = useRouter();

  useEffect(() => {
    if (createRandomGame.isSuccess) {
      router.push(`/play/random/${createRandomGame.data.randomGameID}`);
    }
  }, [createRandomGame.data?.randomGameID, createRandomGame.isSuccess, router]);

  return (
    <>
      <Separator />
      <div className="grid grid-cols-5">
        <div className="col-span-2 flex flex-col items-center gap-6 max-md:ml-1.5 max-md:items-start max-md:gap-3">
          {album.coverPhotoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={album.coverPhotoURL}
              alt={album.name}
              className="h-48 w-48 rounded-lg max-md:h-32 max-md:w-32 max-md:rounded-md"
            />
          )}
          <h2 className="text-2xl font-bold max-md:text-xl">{album.name}</h2>
          <Button
            size="icon"
            className="hidden max-md:inline-flex"
            variant="secondary"
            disabled={createRandomGame.isPending}
            onClick={() =>
              createRandomGame.mutate({
                artistKey,
                album: album.name,
              })
            }
          >
            <Shuffle size="1.25em" />
          </Button>
        </div>

        <div className="col-span-3 flex gap-3">
          <Button
            size="icon"
            className="hidden md:inline-flex"
            variant="secondary"
            disabled={createRandomGame.isPending}
            onClick={() =>
              createRandomGame.mutate({
                artistKey,
                album: album.name,
              })
            }
          >
            <Shuffle size="1.25em" />
          </Button>
          <ul className="grow">
            {album.songs.map((song) => (
              <AlbumSong song={song} key={song.title} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export function AlbumSong({
  song: { title, path },
}: {
  song: NonNullable<ArtistData["otherSongs"]>[number];
}) {
  return (
    <Link href={`/play/${path}`} key={title}>
      <li className="mb-1 w-full rounded-lg px-3 py-1.5 transition-all hover:translate-x-2 hover:bg-accent hover:font-bold max-md:py-1 max-md:text-sm max-md:underline">
        {title}
      </li>
    </Link>
  );
}
