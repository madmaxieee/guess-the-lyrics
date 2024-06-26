import { ratelimit } from "../ratelimit";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import { type NewSong, songs_insert } from "@/db/_schema";
import { artists, type Song, songs_select } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  type ArtistData,
  fetchArtistData,
} from "@/server/scrapers/azlyricsParser";
import { search } from "@/server/scrapers/duckduckgo";
import { artistkey2url } from "@/utils/client";

export const artistRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .mutation(async ({ input }) => {
      if (input.query === "") return [];

      const { success } = await ratelimit.search.limit("search");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      const results = await search(
        `site:azlyrics.com artist ${input.query} lyrics`
      );
      const topResults = results
        .items()
        .filter((result) =>
          /https:\/\/www\.azlyrics\.com\/([a-z]|19)\/[a-z0-9\-]+\.html/.test(
            result.url
          )
        )
        .slice(0, input.topN);

      const topTitleUrl = topResults.map((item) => ({
        title: item.title
          .replace(/[lL]yrics(\s*[-\|]\s*AZLyrics)?.*$/, "")
          .trim(),
        url: item.url,
      }));

      return topTitleUrl;
    }),

  fromAZkey: publicProcedure
    .input(z.object({ key: z.string().min(1) }))
    .query(async ({ input }) => {
      const dbSongList = await db
        .select({
          path: songs_select.path,
          title: songs_select.title,
          artist: songs_select.artist,
          coverPhotoURL: songs_select.coverPhotoURL,
          album: songs_select.album,
        })
        .from(artists)
        .innerJoin(songs_select, eq(artists.key, songs_select.artistKey))
        .where(
          and(
            eq(artists.key, input.key),
            gt(artists.lastSongListUpdate, sql`datetime('now', '-30 days')`)
          )
        )
        .execute();

      if (dbSongList.length > 0) {
        return dbSongs2artistData(dbSongList);
      }

      const { success } = await ratelimit.scrape.limit("scrape");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      let url: string;
      try {
        url = artistkey2url(input.key);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid key",
        });
      }

      let artistData: ArtistData | null = null;
      try {
        artistData = await fetchArtistData(url);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch artist data",
        });
      }

      const valuesToInsert: NewSong[] = [];
      for (const album of artistData.albums) {
        for (const song of album.songs) {
          valuesToInsert.push({
            path: song.path,
            title: song.title,
            artist: artistData.name,
            album: album.name,
            coverPhotoURL: album.coverPhotoURL,
          });
        }
      }

      db.insert(songs_insert)
        .values(valuesToInsert)
        .onConflictDoNothing()
        .execute()
        .catch(console.error);
      db.insert(artists)
        .values({
          key: input.key,
          lastSongListUpdate: sql`CURRENT_TIMESTAMP`,
        })
        .onConflictDoUpdate({
          target: artists.key,
          set: {
            lastSongListUpdate: sql`CURRENT_TIMESTAMP`,
          },
        })
        .execute()
        .catch(console.error);

      return artistData;
    }),
});

function dbSongs2artistData(
  songList: Pick<
    Song,
    "path" | "title" | "artist" | "album" | "coverPhotoURL"
  >[]
): ArtistData {
  if (songList.length === 0) {
    throw new Error("songList is empty");
  }

  // find the most common artist name
  const artistNameCount = songList.reduce((acc, song) => {
    if (song.artist === null) return acc;
    if (acc.has(song.artist)) {
      acc.set(song.artist, acc.get(song.artist)! + 1);
    } else {
      acc.set(song.artist, 1);
    }
    return acc;
  }, new Map<string, number>());
  const [artistName] = [...artistNameCount.entries()].reduce(
    (acc, [k, v]) => {
      if (v > acc[1]) return [k, v];
      return acc;
    },
    ["", 0]
  );

  const albumMap = new Map<string, ArtistData["albums"][number]>();
  const otherSongs: ArtistData["otherSongs"] = [];
  for (const song of songList) {
    if (!song.album) {
      otherSongs.push({
        path: song.path,
        title: song.title ?? "",
      });
      continue;
    }
    const album = albumMap.get(song.album);
    if (album) {
      album.songs.push({
        path: song.path,
        title: song.title ?? "",
      });
    } else {
      albumMap.set(song.album, {
        name: song.album,
        coverPhotoURL: song.coverPhotoURL ?? undefined,
        songs: [
          {
            path: song.path,
            title: song.title ?? "",
          },
        ],
      });
    }
  }

  return {
    name: artistName,
    albums: [...albumMap.values()],
  };
}
