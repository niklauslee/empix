PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_font` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`data` blob NOT NULL,
	`glyphCount` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_font`("id", "userId", "name", "data", "glyphCount", "createdAt", "updatedAt") SELECT "id", "userId", "name", "data", "glyphCount", "createdAt", "updatedAt" FROM `font`;--> statement-breakpoint
DROP TABLE `font`;--> statement-breakpoint
ALTER TABLE `__new_font` RENAME TO `font`;--> statement-breakpoint
PRAGMA foreign_keys=ON;