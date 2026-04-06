ALTER TABLE `roles` ADD `level` varchar(16) DEFAULT '50';--> statement-breakpoint
ALTER TABLE `notifications` ADD `type` enum('info','warning','success','error','task','system') DEFAULT 'info';--> statement-breakpoint
ALTER TABLE `notifications` ADD `action_url` varchar(500);--> statement-breakpoint
ALTER TABLE `notifications` ADD `metadata` json;