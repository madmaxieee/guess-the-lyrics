ALTER TABLE `songs` MODIFY COLUMN `path` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `title` varchar(128);--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `artist` varchar(128);--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `lyrics` varchar(10000);--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `album` varchar(128);--> statement-breakpoint
ALTER TABLE `songs` MODIFY COLUMN `artist_key` VARCHAR(128) AS (SUBSTRING_INDEX(path, '/', 1)) STORED;