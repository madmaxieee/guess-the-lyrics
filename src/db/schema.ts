import {
  customType,
  serial,
  mysqlTable,
  varchar,
  mediumint,
  index,
  timestamp,
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
  (table) => ({
    path_index: index("path_index").on(table.path),
    timesPlayed_index: index("times_played_index").on(table.timesPlayed),
    artistKey_index: index("artist_key_index").on(table.artistKey),
  })
);

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

export const artists = mysqlTable(
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
