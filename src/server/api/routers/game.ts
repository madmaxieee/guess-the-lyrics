import { and, eq, sql } from "drizzle-orm";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import redis from "@/db/redis";
import { songs_select } from "@/db/schema";
import { env } from "@/env.mjs";
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
            path: songs_select.path,
          })
          .from(songs_select)
          .where(
            input.album
              ? and(
                  eq(songs_select.artistKey, input.artistKey),
                  eq(songs_select.album, input.album)
                )
              : eq(songs_select.artistKey, input.artistKey)
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
            path: songs_select.path,
          })
          .from(songs_select)
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
    .input(z.object({ path: z.string().regex(/[a-z0-9\-]+\/[a-z0-9\-]+/) }))
    .mutation(async ({ input, ctx }) => {
      const jwt = await signJWT({ path: input.path });
      ctx.setCookie("gameSessionJWT", jwt, {
        maxAge: SESSION_EXPIRE_SECONDS * 1000,
      });
    }),

  count: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9\-]+\/[a-z0-9\-]+/) }))
    .mutation(async ({ input, ctx }) => {
      const gameSessionJWT = ctx.cookies.gameSessionJWT;
      if (!gameSessionJWT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No game session",
        });
      }

      let payload: GameSessionJWT;
      try {
        const jwt = await verifyJWT(gameSessionJWT);
        payload = jwt.payload;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid game session",
        });
      }

      if (payload.path !== input.path) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `gameSessionID is not for this song, expected ${payload.path}, got ${input.path}`,
        });
      }
      if (Date.now() - payload.iat * 1000 < MIN_PLAYTIME_SECONDS * 1000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough playtime",
        });
      }

      try {
        await db
          .update(songs_select)
          .set({ timesPlayed: sql`${songs_select.timesPlayed} + 1` })
          .where(eq(songs_select.path, input.path))
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

const secret = new TextEncoder().encode(env.JWT_SECRET);
const alg = "HS256" as const;
const issuer = "guess-the-lyrics.vercel.app" as const;
const audience = "guess-the-lyrics.vercel.app" as const;

async function signJWT(payload: Record<string, unknown>) {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime("1h")
    .sign(secret);
  return jwt;
}

const GameSessionJWTSchema = z.object({
  path: z.string(),
  iat: z.number(),
  iss: z.literal("guess-the-lyrics.vercel.app"),
  aud: z.literal("guess-the-lyrics.vercel.app"),
  exp: z.number(),
});

type GameSessionJWT = z.infer<typeof GameSessionJWTSchema>;

async function verifyJWT(jwt: string) {
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secret, {
    issuer,
    audience,
  });
  const safePayload = GameSessionJWTSchema.parse(payload);
  if (safePayload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }
  return {
    payload: safePayload,
    protectedHeader,
  };
}
