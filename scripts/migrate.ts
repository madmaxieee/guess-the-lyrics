import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { createClient } from "@libsql/client";

import { env } from "@/env";

const turso = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso);

await migrate(db, { migrationsFolder: "drizzle" });

turso.close();
