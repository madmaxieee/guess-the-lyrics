import { eq } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import { type Song, songs } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type SongData, fetchSongData } from "@/utils/azlyricsParser";
import { search } from "@/utils/duckduckgo";

export const lyricsRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .query(async ({ input }) => {
      if (input.query === "") return null;
      const result = await search(`site:azlyrics.com ${input.query}`);
      const topResults = result
        .items()
        .filter((result) =>
          result.url.startsWith("https://www.azlyrics.com/lyrics/")
        )
        .slice(0, input.topN);
      const topTitleUrl = topResults.map((item) => ({
        title: item.title.replace(
          /( \| Lyrics at AZLyrics\.com)|(\ Lyrics \| AZLyrics\.com)|( lyrics)|( - AZLyrics)$/,
          ""
        ),
        url: item.url,
      }));
      return topTitleUrl;
    }),

  fromAZpath: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .query(async ({ input }) => {
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
      if (dbSongData) {
        return {
          title: dbSongData.title,
          artist: dbSongData.artist,
          album: dbSongData.album,
          coverPhotoURL: dbSongData.coverPhotoURL,
          lyrics: dbSongData.lyrics ?? "",
        };
      }

      let songData: SongData | null = null;
      try {
        const url = `https://www.azlyrics.com/lyrics/${input.path}.html`;
        songData = await fetchSongData(url);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          message: "Invalid path",
          code: "BAD_REQUEST",
        });
      }
      if (!songData) {
        return null;
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
