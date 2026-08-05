ALTER TABLE `iconSet` RENAME TO `icon_set`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_icon_set` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`data` blob NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`iconCount` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_icon_set`("id", "userId", "name", "data", "width", "height", "iconCount", "createdAt", "updatedAt") SELECT "id", "userId", "name", "data", "width", "height", "iconCount", "createdAt", "updatedAt" FROM `icon_set`;--> statement-breakpoint
DROP TABLE `icon_set`;--> statement-breakpoint
ALTER TABLE `__new_icon_set` RENAME TO `icon_set`;--> statement-breakpoint
PRAGMA foreign_keys=ON;