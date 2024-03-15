import { sqliteTable, text, index, integer } from "drizzle-orm/sqlite-core";

export const songs_insert = sqliteTable(
  "songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path", { length: 256 }).unique().notNull(),
    title: text("title", { length: 128 }),
    artist: text("artist", { length: 128 }),
    album: text("album", { length: 128 }),
    lyrics: text("lyrics", { length: 10000 }),
    coverPhotoURL: text("cover_photo_url", { length: 128 }),
    timesPlayed: integer("times_played").default(0),
  },
  (table) => ({
    path_index: index("path_index").on(table.path),
    timesPlayed_index: index("times_played_index").on(table.timesPlayed),
  })
);

export type NewSong = typeof songs_insert.$inferInsert;
