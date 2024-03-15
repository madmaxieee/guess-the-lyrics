import {
  customType,
  sqliteTable,
  text,
  index,
  integer,
} from "drizzle-orm/sqlite-core";

const artist_key = customType<{ data: string }>({
  dataType() {
    return `TEXT GENERATED ALWAYS AS (substr(path, 1, instr(path, '/') - 1))`;
  },
});

export const songs = sqliteTable(
  "songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path", { length: 256 }).unique().notNull(),
    title: text("title", { length: 128 }),
    artist: text("artist", { length: 128 }),
    lyrics: text("lyrics", { length: 10000 }),
    album: text("album", { length: 128 }),
    coverPhotoURL: text("cover_photo_url", { length: 128 }),
    timesPlayed: integer("times_played").default(0),
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

export const artists = sqliteTable(
  "artists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key", { length: 128 }).unique().notNull(),
    lastSongListUpdate: integer("last_song_list_update", { mode: "timestamp" }),
  },
  (table) => ({
    key_index: index("key_index").on(table.key),
  })
);
