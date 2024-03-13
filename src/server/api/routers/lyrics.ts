import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import { songs } from "@/db/schema";
import { ratelimit } from "@/server/api/ratelimit";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type SongData, fetchSongData } from "@/server/scrapers/azlyricsParser";
import { search } from "@/server/scrapers/duckduckgo";
import { songpath2url } from "@/utils/client";

export const lyricsRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .mutation(async ({ input }) => {
      if (input.query === "") return null;

      const { success } = await ratelimit.search.limit("search");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      const result = await search(`site:azlyrics.com ${input.query}`);
      const topResults = result
        .items()
        .filter((result) =>
          result.url.startsWith("https://www.azlyrics.com/lyrics/")
        )
        .slice(0, input.topN);
      const topTitleUrl = topResults.map((item) => ({
        title: item.title
          .replace(
            /(\| Lyrics at AZLyrics.*)|(Lyrics \| AZLyrics.*)|(lyrics - AZLyrics.*)|(- AZLyrics.*)$/i,
            ""
          )
          .replace(/azlyrics.*/gi, "")
          .trim(),
        url: item.url,
      }));
      return topTitleUrl;
    }),

  fromAZpath: publicProcedure
    .input(
      z.object({
        path: z
          .string()
          .regex(/[a-z0-9\-]+\/[a-z0-9\-]+/)
          .nullish(),
      })
    )
    .query(async ({ input }) => {
      if (!input.path) return null;

      {
        const { success } = await ratelimit.other.limit("lyrics.fromAZpath");
        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Server is busy, try again later",
          });
        }
      }

      const [dbSongData] = await db
        .select({
          title: songs.title,
          artist: songs.artist,
          album: songs.album,
          coverPhotoURL: songs.coverPhotoURL,
          lyrics: songs.lyrics,
        })
        .from(songs)
        .where(eq(songs.path, input.path))
        .execute();
      if (dbSongData?.lyrics) {
        return {
          title: dbSongData.title,
          artist: dbSongData.artist,
          album: dbSongData.album,
          coverPhotoURL: dbSongData.coverPhotoURL,
          lyrics: dbSongData.lyrics,
        };
      }

      {
        const { success } = await ratelimit.scrape.limit("scrape");
        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Server is busy, try again later",
          });
        }
      }

      let url: string;
      try {
        url = songpath2url(input.path);
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid path",
        });
      }

      let songData: SongData | null = null;
      try {
        songData = await fetchSongData(url);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch song data",
        });
      }

      db.insert(songs)
        .values({
          path: input.path,
          title: songData.title,
          artist: songData.artist,
          album: songData.album,
          coverPhotoURL: songData.coverPhotoURL,
          lyrics: songData.lyrics,
        })
        .onDuplicateKeyUpdate({
          set: {
            title: sql`VALUES(title)`,
            artist: sql`VALUES(artist)`,
            album: sql`VALUES(album)`,
            coverPhotoURL: sql`VALUES(cover_photo_url)`,
            lyrics: sql`VALUES(lyrics)`,
          },
        })
        .execute()
        .catch(console.error);

      return {
        title: songData.title,
        artist: songData.artist,
        album: songData.album,
        coverPhotoURL: songData.coverPhotoURL,
        lyrics: songData.lyrics,
      };
    }),
});

export const lyricsRouterCaller = lyricsRouter.createCaller({
  cookies: {},
  setCookie: (_key, _value, _opts) => {
    throw new Error("cannot set cookies in backend code");
  },
});
