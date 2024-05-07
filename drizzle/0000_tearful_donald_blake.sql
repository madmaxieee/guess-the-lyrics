CREATE TABLE `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text(128) NOT NULL,
	`last_song_list_update` integer
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text(256) NOT NULL,
	`title` text(128),
	`artist` text(128),
	`lyrics` text(10000),
	`album` text(128),
	`cover_photo_url` text(128),
	`times_played` integer DEFAULT 0,
	`artist_key` TEXT GENERATED ALWAYS AS (substr(path, 1, instr(path, '/') - 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artists_key_unique` ON `artists` (`key`);--> statement-breakpoint
CREATE INDEX `key_index` ON `artists` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `songs_path_unique` ON `songs` (`path`);--> statement-breakpoint
CREATE INDEX `path_index` ON `songs` (`path`);--> statement-breakpoint
CREATE INDEX `times_played_index` ON `songs` (`times_played`);--> statement-breakpoint
CREATE INDEX `artist_key_index` ON `songs` (`artist_key`);