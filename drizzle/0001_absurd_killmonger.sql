ALTER TABLE `songs` ADD `artist_key` VARCHAR(64) AS (SUBSTRING_INDEX(path, '/', 1)) STORED;--> statement-breakpoint
CREATE INDEX `artist_key_index` ON `songs` (`artist_key`);