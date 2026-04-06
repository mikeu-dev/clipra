ALTER TABLE `clients` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `clients` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `projects` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `projects` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `inventory_warehouses` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `inventory_warehouses` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `inventory_products` ADD `unit` varchar(50);--> statement-breakpoint
ALTER TABLE `inventory_products` ADD `brand` varchar(100);