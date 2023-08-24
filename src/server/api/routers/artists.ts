import { ratelimit } from "../ratelimit";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ArtistData, fetchArtistData } from "@/server/scrapers/azlyricsParser";
import { search } from "@/server/scrapers/duckduckgo";
import { artistkey2url } from "@/utils/client";

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

  fromAZkey: publicProcedure
    .input(z.object({ key: z.string().min(1).nullish() }))
    .query(async ({ input }) => {
      if (!input.key) return null;

      const { success } = await ratelimit.scrape.limit("scrape");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Server is busy, try again later",
        });
      }

      let url: string;
      try {
        url = artistkey2url(input.key);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid key",
        });
      }

      let artistData: ArtistData | null = null;
      try {
        artistData = await fetchArtistData(url);
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch artist data",
        });
      }

      return artistData;
    }),
});
