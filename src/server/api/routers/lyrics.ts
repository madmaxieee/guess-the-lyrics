import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { search } from "@/utils/duckduckgo";
import { getLyrics } from "@/utils/azlyricsParser";

export const lyricsRouter = createTRPCRouter({
  fromKey: publicProcedure
    .input(z.object({ key: z.string().regex(/[a-z\/]+/) }))
    .query(({ input }) => {
      return {
        lyrics: `Hello ${input.key}`,
      };
    }),

  fromQuery: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = await search(`azlyrics ${input.query}`);
      const { url } = result.first();
      const { lyrics } = await getLyrics(url);
      return { lyrics };
    }),
});
