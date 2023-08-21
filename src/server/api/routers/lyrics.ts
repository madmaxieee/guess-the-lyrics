import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { fetchSongData } from "@/utils/azlyricsParser";
import { search } from "@/utils/duckduckgo";

export const lyricsRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (input.query === "") return [];
      const result = await search(`site:azlyrics.com ${input.query}`);
      const top5 = result
        .items()
        .filter((result) =>
          result.url.startsWith("https://www.azlyrics.com/lyrics/")
        )
        .slice(0, 5);
      const top5TitleUrl = top5.map((item) => ({
        title: item.title.replace(
          /( \| Lyrics at AZLyrics\.com)|(\ Lyrics \| AZLyrics\.com)|( lyrics)|( - AZLyrics)$/,
          ""
        ),
        url: item.url,
      }));
      return top5TitleUrl;
    }),

  fromAZid: publicProcedure
    .input(z.object({ id: z.string().regex(/[a-z0-9]+\/[a-z0-9]+/) }))
    .query(async ({ input }) => {
      try {
        const url = `https://www.azlyrics.com/lyrics/${input.id}.html`;
        const songData = await fetchSongData(url);
        return songData;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          message: "Invalid ID",
          code: "BAD_REQUEST",
        });
      }
    }),
});
