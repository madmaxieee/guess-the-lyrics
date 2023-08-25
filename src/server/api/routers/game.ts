import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import redis from "@/db/redis";
import { songs } from "@/db/schema";
import { ratelimit } from "@/server/api/ratelimit";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  MIN_PLAYTIME_SECONDS,
  SESSION_EXPIRE_SECONDS,
} from "@/utils/constants";

import { lyricsRouterCaller } from "./lyrics";

const RANDOM_GAME_TTL = 60 * 60 * 24 * 7; // 1 week
const RANDOM_GAME_ID_PREFIX = "randomGameID:";

export const gameRouter = createTRPCRouter({
  createRandom: publicProcedure
    .input(
      z.union([
        z.object({
          artistKey: z.null().optional(),
          album: z.null().optional(),
        }),
        z.object({
          artistKey: z.string(),
          album: z.nullable(z.string()).optional(),
        }),
      ])
    )
    .mutation(async ({ input }) => {
      const { success } = await ratelimit.other.limit("game.createRandom");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      let randomSongPath: string;
      if (input.artistKey) {
        const [randomSong] = await db
          .select({
            path: songs.path,
          })
          .from(songs)
          .where(
            input.album
              ? and(
                  eq(songs.artistKey, input.artistKey),
                  eq(songs.album, input.album)
                )
              : eq(songs.artistKey, input.artistKey)
          )
          .orderBy(sql`RAND()`)
          .limit(1)
          .execute();

        if (!randomSong) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No song found",
          });
        }

        randomSongPath = randomSong.path;
      } else {
        const [randomSong] = await db
          .select({
            path: songs.path,
          })
          .from(songs)
          .orderBy(sql`RAND()`)
          .limit(1)
          .execute();

        if (!randomSong) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No song found",
          });
        }

        randomSongPath = randomSong.path;
      }

      const randomGameID = nanoid();
      await redis.set(
        `${RANDOM_GAME_ID_PREFIX}:${randomGameID}`,
        randomSongPath,
        {
          ex: RANDOM_GAME_TTL,
        }
      );

      return {
        randomGameID,
      };
    }),

  getRandom: publicProcedure
    .input(z.object({ randomGameID: z.string() }))
    .query(async ({ input }) => {
      const { success } = await ratelimit.other.limit("game.getRandom");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      const randomSongPath = await redis.get<string>(
        `${RANDOM_GAME_ID_PREFIX}:${input.randomGameID}`
      );

      if (!randomSongPath) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid randomGameID",
        });
      }

      const songData = await lyricsRouterCaller.fromAZpath({
        path: randomSongPath,
      });
      if (!songData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid path",
        });
      }

      return {
        ...songData,
        path: randomSongPath,
      };
    }),

  start: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .mutation(async ({ input, ctx }) => {
      const { success } = await ratelimit.other.limit("game.start");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

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
      const { success } = await ratelimit.other.limit("game.count");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

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
