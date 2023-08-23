CREATE TABLE `songs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`path` varchar(128) NOT NULL,
	`title` varchar(64),
	`artist` varchar(64),
	`lyrics` varchar(8192),
	`album` varchar(64),
	`cover_photo_url` varchar(128),
	`times_played` mediumint DEFAULT 0,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`),
	CONSTRAINT `songs_path_unique` UNIQUE(`path`)
);
--> statement-breakpoint
CREATE INDEX `path_index` ON `songs` (`path`);--> statement-breakpoint
CREATE INDEX `times_played_index` ON `songs` (`times_played`);