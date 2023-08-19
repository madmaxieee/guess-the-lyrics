import { createTRPCRouter } from "@/server/api/trpc";

import { exampleRouter } from "./routers/example";
import { lyricsRouter } from "./routers/lyrics";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  lyrics: lyricsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
