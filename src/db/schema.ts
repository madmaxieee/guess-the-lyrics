import {
  customType,
  sqliteTable,
  text,
  index,
  integer,
} from "drizzle-orm/sqlite-core";

import type { RouterOutput } from "@/utils/routerTypes";

const artist_key = customType<{ data: string; notNull: true; default: true }>({
  dataType() {
    return `TEXT GENERATED ALWAYS AS (substr(path, 1, instr(path, '/') - 1))`;
  },
});

export const songs_select = sqliteTable(
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
    artistKey: artist_key("artist_key"),
  },
  (table) => ({
    path_index: index("path_index").on(table.path),
    timesPlayed_index: index("times_played_index").on(table.timesPlayed),
    artistKey_index: index("artist_key_index").on(table.artistKey),
  })
);

export type Song = typeof songs_select.$inferSelect;

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

type SearchResults = {
  title: string;
  url: string;
}[];

export const search_cache = sqliteTable(
  "search_cache",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    query: text("query", { length: 256 }).unique().notNull(),
    searchMode: text("search_mode", {
      length: 8,
      enum: ["artists", "songs"],
    }).notNull(),
    results: text("text", { mode: "json" }).$type<SearchResults>().notNull(),
    lastUpdate: integer("last_update", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    query_index: index("query_index").on(table.query),
    lastUpdate_index: index("last_update_index").on(table.lastUpdate),
  })
);
