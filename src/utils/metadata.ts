import type { Metadata } from "next";
import { headers } from "next/headers";

import { env } from "@/env";

const description =
  "Are you a real fan? Try to guess the lyrics of your favorite songs now! Challenge your friends and see who's the real one!";

type MetadataArgs = {
  songName?: string | null;
  artistName?: string | null;
  coverPhotoUrl?: string | null;
};

export function makeMetadata(args: MetadataArgs): Metadata {
  const { songName, artistName } = args;
  const heads = headers();
  const pathname = heads.get("next-url") ?? "/";
  const title = songName
    ? `guess the lyrics. | ${songName}`
    : artistName
    ? `guess the lyrics. | ${artistName}`
    : "guess the lyrics.";
  const url = new URL(env.NEXT_PUBLIC_DOMAIN);
  url.pathname = pathname;
  return {
    title,
    description,
    keywords:
      "guess the lyrics, guess, lyrics, game, music, songs, lyrics game, swiftie",
    icons: "/favicon.ico",
    openGraph: {
      title,
      url: url.toString(),
      type: "website",
      description,
      images: [
        {
          url: makeOgURL(args),
          width: 1600,
          height: 800,
          alt: title,
        },
      ],
      siteName: "guess the lyrics.",
      locale: "en_US",
    },
    alternates: {
      canonical: url.toString(),
    },
  };
}

function makeOgURL({
  artistName,
  songName,
  coverPhotoUrl,
}: MetadataArgs): string {
  if (!artistName && !songName) return env.NEXT_PUBLIC_DOMAIN + "/og-image.png";
  const ogUrl = new URL(env.NEXT_PUBLIC_DOMAIN + "/og/song");
  if (artistName) {
    ogUrl.searchParams.append("artist", artistName);
  }
  if (songName) {
    ogUrl.searchParams.append("song", songName);
  }
  if (coverPhotoUrl) {
    ogUrl.searchParams.append("image_url", coverPhotoUrl);
  }
  return ogUrl.toString();
}
