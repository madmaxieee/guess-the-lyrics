import { and, eq, sql } from "drizzle-orm";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import redis from "@/db/redis";
import { songs_select } from "@/db/schema";
import { env } from "@/env";
import { ratelimit } from "@/server/api/ratelimit";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  MIN_PLAYTIME_SECONDS,
  SESSION_EXPIRE_SECONDS,
} from "@/utils/constants";

import { lyricsCaller } from "./lyrics";

const RANDOM_GAME_TTL = 60 * 60 * 24 * 7; // 1 week
const RANDOM_GAME_ID_PREFIX = "randomGameID:" as const;
const GAME_SESSION_JWT_COOKIE = "gameSessionJWT" as const;

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
          .orderBy(sql`random()`)
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
          .orderBy(sql`random()`)
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

      const songData = await lyricsCaller.fromAZpath({
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
    .mutation(async ({ input }) => {
      const jwt = await signJWT({ path: input.path });
      cookies().set(GAME_SESSION_JWT_COOKIE, jwt, {
        maxAge: SESSION_EXPIRE_SECONDS * 1000,
      });
    }),

  count: publicProcedure
    .input(z.object({ path: z.string().regex(/[a-z0-9\-]+\/[a-z0-9\-]+/) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.cookies === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No cookies",
        });
      }

      const gameSessionJWT = ctx.cookies.get(GAME_SESSION_JWT_COOKIE)?.value;
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

      if (process.env.NODE_ENV !== "production") return;

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
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
}

const GameSessionJWTSchema = z.object({
  path: z.string(),
  iss: z.literal("guess-the-lyrics.vercel.app"),
  aud: z.literal("guess-the-lyrics.vercel.app"),
  iat: z.number(),
  exp: z.number(),
});

type GameSessionJWT = z.infer<typeof GameSessionJWTSchema>;

async function verifyJWT(jwt: string) {
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secret, {
    issuer,
    audience,
  });
  const safePayload = GameSessionJWTSchema.parse(payload);
  return {
    payload: safePayload,
    protectedHeader,
  };
}
