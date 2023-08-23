import "@/db";
import "@/db/redis";
import { createTRPCRouter } from "@/server/api/trpc";

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
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
