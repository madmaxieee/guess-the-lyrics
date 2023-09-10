import { Ratelimit } from "@upstash/ratelimit";

import redis from "@/db/redis";

export const ratelimit = {
  scrape: new Ratelimit({
    redis: redis,
    prefix: "ratelimit:api",
    limiter: Ratelimit.slidingWindow(3, "10 s"),
    analytics: true,
  }),
  search: new Ratelimit({
    redis: redis,
    prefix: "ratelimit:api",
    limiter: Ratelimit.slidingWindow(5, "15 s"),
    analytics: true,
  }),
  other: new Ratelimit({
    redis: redis,
    prefix: "ratelimit:api",
    limiter: Ratelimit.slidingWindow(20, "1 s"),
    analytics: true,
  }),
};
