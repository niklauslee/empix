PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scene` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`data` blob NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`shapeCount` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scene`("id", "userId", "name", "data", "width", "height", "shapeCount", "createdAt", "updatedAt") SELECT "id", "userId", "name", "data", "width", "height", "shapeCount", "createdAt", "updatedAt" FROM `scene`;--> statement-breakpoint
DROP TABLE `scene`;--> statement-breakpoint
ALTER TABLE `__new_scene` RENAME TO `scene`;--> statement-breakpoint
PRAGMA foreign_keys=ON;