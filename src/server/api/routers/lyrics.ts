import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { search } from "@/utils/duckduckgo";
import { getSongData } from "@/utils/azlyricsParser";

export const lyricsRouter = createTRPCRouter({
  fromID: publicProcedure
    .input(z.object({ id: z.string().regex(/[a-z\/]+/) }))
    .query(({ input }) => {
      return {
        lyrics: `Hello ${input.id}`,
      };
    }),

  fromQuery: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = await search(`azlyrics ${input.query}`);
      const { url } = result.first();
      const songData = await getSongData(url);
      return songData;
    }),
});
