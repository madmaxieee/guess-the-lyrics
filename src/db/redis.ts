import { Redis } from "@upstash/redis";

import { env } from "@/env";

const redis = new Redis({
  url: env.UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
});

export default redis;
