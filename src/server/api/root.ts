import "@/db";
import "@/db/redis";
import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";

import { artistRouter } from "./routers/artists";
import { gameRouter } from "./routers/game";
import { lyricsRouter } from "./routers/lyrics";
import { mockRouter } from "./routers/mock";
import { testRouter } from "./routers/test";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  mock: mockRouter,
  lyrics: lyricsRouter,
  artist: artistRouter,
  game: gameRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
