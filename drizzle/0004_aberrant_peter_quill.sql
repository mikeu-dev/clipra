CREATE TABLE `schedules` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` varchar(36) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`priority` enum('normal','urgent') DEFAULT 'normal',
	`target_type` enum('all','role','user') NOT NULL,
	`target_value` json,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`published_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcement_recipients` (
	`id` varchar(36) NOT NULL,
	`announcement_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`read_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `announcement_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcement_recipients` ADD CONSTRAINT `announcement_recipients_announcement_id_announcements_id_fk` FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcement_recipients` ADD CONSTRAINT `announcement_recipients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_schedules_user_id` ON `schedules` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_schedules_start_date` ON `schedules` (`start_date`);--> statement-breakpoint
CREATE INDEX `idx_announcements_status` ON `announcements` (`status`);--> statement-breakpoint
CREATE INDEX `idx_announcements_created_by` ON `announcements` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_ar_announcement` ON `announcement_recipients` (`announcement_id`);--> statement-breakpoint
CREATE INDEX `idx_ar_user` ON `announcement_recipients` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_ar_announcement_user` ON `announcement_recipients` (`announcement_id`,`user_id`);