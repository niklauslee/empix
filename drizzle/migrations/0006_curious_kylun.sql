ALTER TABLE `iconProject` RENAME TO `iconSet`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_iconSet` (
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
INSERT INTO `__new_iconSet`("id", "userId", "name", "data", "width", "height", "iconCount", "createdAt", "updatedAt") SELECT "id", "userId", "name", "data", "width", "height", "iconCount", "createdAt", "updatedAt" FROM `iconSet`;--> statement-breakpoint
DROP TABLE `iconSet`;--> statement-breakpoint
ALTER TABLE `__new_iconSet` RENAME TO `iconSet`;--> statement-breakpoint
PRAGMA foreign_keys=ON;