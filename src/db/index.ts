import { drizzle } from "drizzle-orm/planetscale-serverless";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";

import { connect } from "@planetscale/database";

import { env } from "@/env.mjs";

// create the connection
const connection = connect({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
});

const db = drizzle(connection);
if (env.NODE_ENV === "production") {
  migrate(db, { migrationsFolder: "./drizzle" })
    .then(() => console.log("migrated"))
    .catch(console.error);
}

export default db;
