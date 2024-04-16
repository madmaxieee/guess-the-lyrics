CREATE TABLE `search_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`query` text(256) NOT NULL,
	`search_mode` text(8) NOT NULL,
	`text` text NOT NULL,
	`last_update` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_cache_query_unique` ON `search_cache` (`query`);--> statement-breakpoint
CREATE INDEX `query_index` ON `search_cache` (`query`);--> statement-breakpoint
CREATE INDEX `last_update_index` ON `search_cache` (`last_update`);