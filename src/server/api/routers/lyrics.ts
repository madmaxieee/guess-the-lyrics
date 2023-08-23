import { eq, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import redis from "@/db/redis";
import { songs } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type SongData, fetchSongData } from "@/utils/azlyricsParser";
import {
  MIN_PLAYTIME_SECONDS,
  SESSION_EXPIRE_SECONDS,
} from "@/utils/constants";
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
    .input(
      z.object({
        path: z
          .string()
          .regex(/[a-z0-9]+\/[a-z0-9]+/)
          .nullish(),
      })
    )
    .query(async ({ input }) => {
      if (!input.path) return null;
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
          code: "BAD_REQUEST",
          message: "Invalid path",
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

  start: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.cookies.gameSessionID) {
        const gameSessionID = ctx.cookies.gameSessionID;
        const createdAt = await redis.get(gameSessionID);
        if (createdAt) {
          await redis.set(
            gameSessionID,
            {
              path: input.path,
              createdAt: Date.now(),
            },
            { ex: SESSION_EXPIRE_SECONDS }
          );
          return;
        }
      }
      const gameSessionID = uuid();
      await redis.set(gameSessionID, Date.now(), {
        ex: SESSION_EXPIRE_SECONDS,
      });
      ctx.setCookie("gameSessionID", gameSessionID, {
        maxAge: SESSION_EXPIRE_SECONDS * 1000,
      });
    }),

  count: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .mutation(async ({ input, ctx }) => {
      const gameSessionID = ctx.cookies.gameSessionID;
      if (!gameSessionID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No game session",
        });
      }

      const data = await redis.get<{
        path: string;
        createdAt: number;
      }>(gameSessionID);
      if (!data) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No game session",
        });
      }

      const { path, createdAt } = data;
      if (path !== input.path) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `gameSessionID is not for this song, expected ${path}, got ${input.path}`,
        });
      }
      if (Date.now() - createdAt < MIN_PLAYTIME_SECONDS * 1000) {
        console.log(Date.now() - createdAt);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough playtime",
        });
      }

      try {
        await db
          .update(songs)
          .set({ timesPlayed: sql`${songs.timesPlayed} + 1` })
          .where(eq(songs.path, input.path))
          .execute();
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid path",
        });
      }
    }),
});
