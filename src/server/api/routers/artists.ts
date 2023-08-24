import { ratelimit } from "../ratelimit";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { search } from "@/server/scrapers/duckduckgo";

export const artistRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .mutation(async ({ input }) => {
      if (input.query === "") return null;

      const { success } = await ratelimit.search.limit("search");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      const results = await search(
        `site:azlyrics.com artist ${input.query} lyrics`
      );
      const topResults = results
        .items()
        .filter((result) =>
          /https:\/\/www\.azlyrics\.com\/([a-z]|19)\/[a-z0-9]+\.html/.test(
            result.url
          )
        )
        .slice(0, input.topN);

      const topTitleUrl = topResults.map((item) => ({
        title: item.title
          .replace(/[lL]yrics(\s*[-\|]\s*AZLyrics)?.*$/, "")
          .trim(),
        url: item.url,
      }));

      return topTitleUrl;
    }),
});
