import {
  serial,
  mysqlTable,
  varchar,
  mediumint,
  index,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const songs = mysqlTable(
  "songs",
  {
    id: serial("id").primaryKey(),
    path: varchar("path", { length: 128 }).unique().notNull(),
    title: varchar("title", { length: 64 }),
    artist: varchar("artist", { length: 64 }),
    lyrics: varchar("lyrics", { length: 8192 }),
    album: varchar("album", { length: 64 }),
    coverPhotoURL: varchar("cover_photo_url", { length: 128 }),
    timesPlayed: mediumint("times_played").default(0),
  },
  (table) => {
    return {
      path_index: index("path_index").on(table.path),
      timesPlayed_index: index("times_played_index").on(table.timesPlayed),
    };
  }
);

export const selectUserSchema = createSelectSchema(songs);
export const insertUserSchema = createInsertSchema(songs);

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
