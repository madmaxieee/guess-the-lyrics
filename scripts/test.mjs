import "dotenv/config";
import { and, eq, sql } from "drizzle-orm";
import { MySqlDialect, timestamp } from "drizzle-orm/mysql-core";
import { customType } from "drizzle-orm/mysql-core";
import {
  serial,
  mysqlTable,
  varchar,
  mediumint,
  index,
} from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { connect } from "@planetscale/database";

const artist_key = customType({
  dataType() {
    return `VARCHAR(128) AS (SUBSTRING_INDEX(path, '/', 1)) STORED`;
  },
});

const songs = mysqlTable(
  "songs",
  {
    id: serial("id").primaryKey(),
    path: varchar("path", { length: 256 }).unique().notNull(),
    title: varchar("title", { length: 128 }),
    artist: varchar("artist", { length: 128 }),
    lyrics: varchar("lyrics", { length: 10000 }),
    album: varchar("album", { length: 128 }),
    coverPhotoURL: varchar("cover_photo_url", { length: 128 }),
    timesPlayed: mediumint("times_played").default(0),
    artistKey: artist_key("artist_key"),
  },
  (table) => {
    return {
      path_index: index("path_index").on(table.path),
      timesPlayed_index: index("times_played_index").on(table.timesPlayed),
      artistKey_index: index("artist_key_index").on(table.artistKey),
    };
  }
);

const artists = mysqlTable(
  "artists",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 128 }).unique().notNull(),
    lastSongListUpdate: timestamp("last_song_list_update"),
  },
  (table) => ({
    key_index: index("key_index").on(table.key),
  })
);

const mysqlDialect = new MySqlDialect();
const statement = mysqlDialect.sqlToQuery(
  sql`REPLACE INTO ${songs} ${[songs.path, songs.title]} VALUES ${[
    "artist/test1",
    "test1",
  ]},${["artist/test2", "test2"]}`
);

// create the connection
const connection = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const db = drizzle(connection);

const statement2 = db
  .select({
    title: songs.title,
    key: artists.key,
  })
  .from(artists)
  .innerJoin(songs, eq(songs.artistKey, artists.key))
  .where(and(eq(artists.key, "artist"), eq(songs.title, "test")))
  .toSQL();

console.log({ test: statement2 });
