import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { fetchSongData } from "@/utils/azlyricsParser";
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
    .input(z.object({ path: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .query(async ({ input }) => {
      try {
        const url = `https://www.azlyrics.com/lyrics/${input.path}.html`;
        const songData = await fetchSongData(url);
        return songData;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          message: "Invalid path",
          code: "BAD_REQUEST",
        });
      }
    }),
});
