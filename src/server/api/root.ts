import { createTRPCRouter } from "@/server/api/trpc";

import { lyricsRouter } from "./routers/lyrics";
import { mockRouter } from "./routers/mock";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  mock: mockRouter,
  lyrics: lyricsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
