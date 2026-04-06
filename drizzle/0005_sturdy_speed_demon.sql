CREATE TABLE `purchase_requisition_lines` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`requisition_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) DEFAULT '1',
	`estimated_unit_price` decimal(15,2) DEFAULT '0',
	`subtotal` decimal(15,2) DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requisition_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_requisitions` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`number` varchar(50) NOT NULL,
	`requested_by_id` varchar(36) NOT NULL,
	`approved_by_id` varchar(36),
	`date` date NOT NULL,
	`state` enum('draft','requested','approved','rejected','ordered','cancelled') DEFAULT 'draft',
	`description` text,
	`total_amount` decimal(15,2) DEFAULT '0',
	`project_id` varchar(36),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requisitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_requisitions_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
ALTER TABLE `schedules` ADD `link` varchar(255);--> statement-breakpoint
ALTER TABLE `schedules` ADD `is_all_day` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `schedules` ADD `recurrence` varchar(50) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `employees` ADD `hourly_rate` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `clients` ADD `type` enum('client','vendor','both') DEFAULT 'client';--> statement-breakpoint
ALTER TABLE `projects` ADD `total_budget` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `projects` ADD `estimated_hours` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD `project_id` varchar(36);--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD `project_id` varchar(36);--> statement-breakpoint
ALTER TABLE `purchase_requisition_lines` ADD CONSTRAINT `purchase_requisition_lines_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisition_lines` ADD CONSTRAINT `purchase_requisition_lines_requisition_id_purchase_requisitions_id_fk` FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisitions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisition_lines` ADD CONSTRAINT `purchase_requisition_lines_product_id_inventory_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `inventory_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD CONSTRAINT `purchase_requisitions_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD CONSTRAINT `purchase_requisitions_requested_by_id_users_id_fk` FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD CONSTRAINT `purchase_requisitions_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD CONSTRAINT `purchase_requisitions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_purchase_requisitions_date` ON `purchase_requisitions` (`date`);--> statement-breakpoint
CREATE INDEX `idx_purchase_requisitions_state` ON `purchase_requisitions` (`state`);--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD CONSTRAINT `crm_sales_orders_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;