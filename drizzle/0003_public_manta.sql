CREATE TABLE `artists` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`last_song_list_update` timestamp,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE INDEX `key_index` ON `artists` (`key`);