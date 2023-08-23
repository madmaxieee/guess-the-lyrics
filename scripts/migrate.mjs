import "dotenv/config";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";

import { connect } from "@planetscale/database";

const env = process.env;

const connection = connect({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
});

const db = drizzle(connection);

migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => console.log("migrated"))
  .catch(console.error);
