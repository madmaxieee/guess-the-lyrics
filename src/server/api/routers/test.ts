import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const testRouter = createTRPCRouter({
  heartbeat: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello ${input}`;
  }),
});
