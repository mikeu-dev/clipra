CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`parent_id` varchar(36),
	`type` varchar(50) NOT NULL,
	`color` varchar(50),
	`icon` varchar(50),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorizables` (
	`category_id` varchar(36) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	CONSTRAINT `categorizables_category_id_entity_id_entity_type_pk` PRIMARY KEY(`category_id`,`entity_id`,`entity_type`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `categorizables` ADD CONSTRAINT `categorizables_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_categorizables_entity` ON `categorizables` (`entity_id`,`entity_type`);