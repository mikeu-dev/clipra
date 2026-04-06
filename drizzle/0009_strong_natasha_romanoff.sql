ALTER TABLE `purchase_requisition_lines` DROP FOREIGN KEY `purchase_requisition_lines_requisition_id_purchase_requisitions_id_fk`;
--> statement-breakpoint
ALTER TABLE `purchase_requisition_lines` ADD CONSTRAINT `purchase_req_lines_requisition_id_fk` FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisitions`(`id`) ON DELETE cascade ON UPDATE no action;