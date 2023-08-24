import { customType } from "drizzle-orm/mysql-core";
import {
  serial,
  mysqlTable,
  varchar,
  mediumint,
  index,
} from "drizzle-orm/mysql-core";

const artist_key = customType<{ data: string }>({
  dataType() {
    return `VARCHAR(128) AS (SUBSTRING_INDEX(path, '/', 1)) STORED`;
  },
});

export const songs = mysqlTable(
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

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
