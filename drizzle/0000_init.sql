CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36),
	`name` varchar(64) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banks` (
	`id` varchar(36) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `banks_id` PRIMARY KEY(`id`),
	CONSTRAINT `banks_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `religions` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `religions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`username` varchar(80) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email_verified` boolean DEFAULT false,
	`verification_token` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(50),
	`code` varchar(50),
	`logo` varchar(255),
	`theme_config` json,
	`is_public` boolean DEFAULT false,
	`address` text,
	`phone` varchar(20),
	`email` varchar(255),
	`website` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `companies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`id_card` varchar(50),
	`nik` varchar(20),
	`position_id` varchar(36),
	`role_id` varchar(36),
	`shift_id` varchar(36),
	`bank_name` varchar(100),
	`bank_account_number` varchar(50),
	`enhancer` varchar(36),
	`status` enum('permanent','contract','probation','internship','resigned','terminated') DEFAULT 'probation',
	`join_date` date,
	`tax_number` varchar(50),
	`biometric_image` varchar(255),
	`is_public` boolean DEFAULT true,
	`reports_to` varchar(36),
	`division` varchar(255),
	`work_phone` varchar(20),
	`work_email` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_salaries` (
	`id` varchar(36) NOT NULL,
	`employee_id` varchar(36) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`type` enum('monthly','weekly','hourly') DEFAULT 'monthly',
	`effective_date` date NOT NULL,
	`end_date` date,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_salaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_comments` (
	`id` varchar(36) NOT NULL,
	`task_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`address` text,
	`birth_date` date,
	`gender` enum('male','female','other'),
	`phone` varchar(20),
	`bio` text,
	`avatar` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` text,
	`base_salary` decimal(15,2) DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`name` text,
	`address` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` text,
	`start_time` time NOT NULL DEFAULT '09:00:00',
	`end_time` time NOT NULL DEFAULT '17:00:00',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`name` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `shift_schedules` (
	`id` varchar(36) NOT NULL,
	`shift_id` varchar(36) NOT NULL,
	`day` enum('0','1','2','3','4','5','6') NOT NULL,
	`in` time NOT NULL,
	`out` time NOT NULL,
	`break` time NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `shift_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presences` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`company_id` varchar(36),
	`position_id` varchar(36),
	`enhancer` varchar(36),
	`fingerprint` varchar(50),
	`time` datetime NOT NULL,
	`piece` decimal(5,2) DEFAULT '0.00',
	`price` decimal(15,2) DEFAULT '0.00',
	`late` int DEFAULT 0,
	`overtime` int DEFAULT 0,
	`earlier` int DEFAULT 0,
	`type` enum('offline','online') DEFAULT 'offline',
	`category` enum('in','out') NOT NULL,
	`coordinate` text,
	`biometric` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `presences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`name` text,
	`code` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `stages_id` PRIMARY KEY(`id`),
	CONSTRAINT `stages_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`session_token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`owner_type` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`url` varchar(512) NOT NULL,
	`file_type` varchar(64),
	`size` int,
	`is_public` boolean DEFAULT false,
	`thumbnail_url` varchar(512),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36),
	`group` varchar(64),
	`key` varchar(128) NOT NULL,
	`value` varchar(1024) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `key_company_idx` UNIQUE(`key`,`company_id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_email` varchar(255),
	`phone` varchar(20),
	`logo` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`start_date` date,
	`due_date` date,
	`status` enum('pending','active','completed','on_hold') DEFAULT 'pending',
	`thumbnail` varchar(255),
	`mockup` varchar(255),
	`category` varchar(50),
	`tech_stack` json,
	`is_portfolio` boolean DEFAULT false,
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_users` (
	`project_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_users_project_id_user_id_pk` PRIMARY KEY(`project_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `project_columns` (
	`id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) DEFAULT '#6B7280',
	`position` int NOT NULL DEFAULT 0,
	`wip_limit` int,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`parent_id` varchar(36),
	`column_id` varchar(36),
	`assigned_to` varchar(36),
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`deadline` date,
	`position` int NOT NULL DEFAULT 0,
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_activities` (
	`id` varchar(36) NOT NULL,
	`task_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('move','create','update','delete','comment') NOT NULL,
	`data` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `task_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` longtext,
	`published` boolean DEFAULT false,
	`published_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`action` varchar(255) NOT NULL,
	`entity_type` varchar(64),
	`entity_id` varchar(36),
	`meta` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`before` json,
	`after` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`thumbnail` text,
	`views` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`tags` json,
	`type` varchar(50),
	`published` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `taggables` (
	`id` varchar(36) NOT NULL,
	`tag_id` varchar(36) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	CONSTRAINT `taggables_id` PRIMARY KEY(`id`),
	CONSTRAINT `taggables_tag_id_unique` UNIQUE(`tag_id`),
	CONSTRAINT `taggables_entity_type_unique` UNIQUE(`entity_type`),
	CONSTRAINT `taggables_entity_id_unique` UNIQUE(`entity_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`read_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`user_agent` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`owner_type` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`url` varchar(512) NOT NULL,
	`file_type` varchar(64),
	`size` int,
	`is_public` boolean DEFAULT false,
	`thumbnail_url` varchar(512),
	`deleted_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` varchar(36) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`company` varchar(150),
	`email` varchar(150) NOT NULL,
	`phone_number` varchar(20),
	`message` text NOT NULL,
	`agreed_policy` boolean NOT NULL DEFAULT false,
	`is_read` boolean NOT NULL DEFAULT false,
	`is_replied` boolean NOT NULL DEFAULT false,
	`reply_message` text,
	`replied_at` datetime,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriptions` (
	`id` varchar(36) NOT NULL,
	`email` varchar(150) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`is_subscribed` boolean DEFAULT true,
	`unsubscribe_token` varchar(64),
	`unsubscribed_at` datetime,
	CONSTRAINT `newsletter_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`location` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`requirements` text,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `job_applicants` (
	`id` varchar(36) NOT NULL,
	`job_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`resume` varchar(255) NOT NULL,
	`cover_letter` text,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_applicants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) DEFAULT '1',
	`unit_price` decimal(15,2) DEFAULT '0',
	`amount` decimal(15,2) DEFAULT '0',
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_payments` (
	`id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`payment_date` date NOT NULL,
	`method` varchar(50),
	`reference` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `invoice_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`project_id` varchar(36),
	`number` varchar(50) NOT NULL,
	`issue_date` date NOT NULL,
	`due_date` date,
	`type` enum('out_invoice','in_invoice') DEFAULT 'out_invoice',
	`status` enum('draft','sent','paid','partially_paid','overdue','cancelled') DEFAULT 'draft',
	`subtotal` decimal(15,2) DEFAULT '0',
	`tax_total` decimal(15,2) DEFAULT '0',
	`total` decimal(15,2) DEFAULT '0',
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` varchar(36) NOT NULL,
	`project_id` varchar(36),
	`user_id` varchar(36) NOT NULL,
	`category` varchar(100),
	`description` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`date` date NOT NULL,
	`status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
	`receipt_url` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`project_id` varchar(36),
	`task_id` varchar(36),
	`date` date NOT NULL,
	`hours` decimal(5,2) NOT NULL,
	`description` text,
	`status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timesheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('annual','sick','unpaid','other') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`approved_by` varchar(36),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL,
	`name` varchar(64) NOT NULL,
	`description` varchar(255),
	`resource` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`image` varchar(255),
	`title_id` varchar(255),
	`title_en` varchar(255),
	`description_id` text,
	`description_en` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_batches` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`period` date NOT NULL,
	`status` enum('draft','processed','paid','cancelled') DEFAULT 'draft',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrolls` (
	`id` varchar(36) NOT NULL,
	`batch_id` varchar(36) NOT NULL,
	`employee_id` varchar(36) NOT NULL,
	`base_salary` decimal(15,2) DEFAULT '0',
	`total_allowance` decimal(15,2) DEFAULT '0',
	`total_deduction` decimal(15,2) DEFAULT '0',
	`net_salary` decimal(15,2) DEFAULT '0',
	`details` json,
	`status` enum('pending','processing','paid','failed') DEFAULT 'pending',
	`gateway_ref_id` varchar(255),
	`gateway_status` varchar(50),
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `payrolls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_payment_logs` (
	`id` varchar(36) NOT NULL,
	`payroll_id` varchar(36) NOT NULL,
	`action` varchar(50) NOT NULL,
	`payload` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_payment_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_salary_components` (
	`id` varchar(36) NOT NULL,
	`employee_id` varchar(36) NOT NULL,
	`component_id` varchar(36) NOT NULL,
	`amount` decimal(15,2) DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `employee_salary_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salary_components` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('allowance','deduction') NOT NULL,
	`calculation_type` enum('fixed','percentage') DEFAULT 'fixed',
	`default_amount` decimal(15,2) DEFAULT '0',
	`account_id` varchar(36),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salary_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`action` enum('create','update','delete','login','logout','export','other') NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(36),
	`old_value` text,
	`new_value` text,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(100),
	`ip_address` varchar(50),
	`port` int DEFAULT 80,
	`username` varchar(50),
	`password` varchar(100),
	`is_active` boolean DEFAULT true,
	`last_seen` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounting_accounts` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('receivable','payable','liquidity','current_assets','bank','cash','assets','liability','equity','income','expense','cost_of_revenue','other_income','other_expense') NOT NULL,
	`reconcile` boolean DEFAULT false,
	`description` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounting_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounting_journals` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(10) NOT NULL,
	`type` enum('sale','purchase','cash','bank','general') NOT NULL,
	`default_account_id` varchar(36),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounting_journals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounting_journal_entries` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`journal_id` varchar(36) NOT NULL,
	`number` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`reference` varchar(255),
	`state` enum('draft','posted','cancelled') DEFAULT 'draft',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounting_journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounting_journal_items` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`journal_entry_id` varchar(36) NOT NULL,
	`account_id` varchar(36) NOT NULL,
	`partner_id` varchar(36),
	`name` varchar(255),
	`debit` decimal(15,2) DEFAULT '0',
	`credit` decimal(15,2) DEFAULT '0',
	`date` date NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `accounting_journal_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_locations` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`usage` varchar(50) DEFAULT 'internal',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_warehouses` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`address` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_product_categories` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`parent_id` varchar(36),
	`costing_method` enum('standard','average','fifo') DEFAULT 'standard',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_product_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_products` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`code` varchar(100),
	`description` text,
	`type` enum('goods','service','consumable') DEFAULT 'goods',
	`sales_price` decimal(15,2) DEFAULT '0',
	`cost` decimal(15,2) DEFAULT '0',
	`income_account_id` varchar(36),
	`expense_account_id` varchar(36),
	`image` varchar(255),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_stock_moves` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`location_id` varchar(36) NOT NULL,
	`location_dest_id` varchar(36) NOT NULL,
	`quantity` decimal(15,2) NOT NULL DEFAULT '0',
	`reference` varchar(100),
	`state` enum('draft','confirmed','assigned','done','cancelled') DEFAULT 'draft',
	`date` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_stock_moves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_stock_quants` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`location_id` varchar(36) NOT NULL,
	`quantity` decimal(15,2) NOT NULL DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_stock_quants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_leads` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`phone` varchar(50),
	`client_id` varchar(36),
	`salesperson_id` varchar(36),
	`type` enum('lead','opportunity') DEFAULT 'lead',
	`stage` enum('new','qualified','proposition','negotiation','won','lost') DEFAULT 'new',
	`expected_revenue` decimal(15,2) DEFAULT '0',
	`probability` decimal(5,2) DEFAULT '0',
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_sales_order_lines` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) DEFAULT '1',
	`unit_price` decimal(15,2) DEFAULT '0',
	`tax_rate` decimal(5,2) DEFAULT '0',
	`subtotal` decimal(15,2) DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `crm_sales_order_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_sales_orders` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`number` varchar(50) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`salesperson_id` varchar(36),
	`lead_id` varchar(36),
	`date` date NOT NULL,
	`valid_until` date,
	`state` enum('draft','sent','sale','done','cancelled') DEFAULT 'draft',
	`subtotal` decimal(15,2) DEFAULT '0',
	`tax_total` decimal(15,2) DEFAULT '0',
	`total` decimal(15,2) DEFAULT '0',
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_sales_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `crm_sales_orders_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_lines` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) DEFAULT '1',
	`unit_price` decimal(15,2) DEFAULT '0',
	`tax_rate` decimal(5,2) DEFAULT '0',
	`subtotal` decimal(15,2) DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_order_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`number` varchar(50) NOT NULL,
	`supplier_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36),
	`user_id` varchar(36),
	`date` date NOT NULL,
	`expected_date` date,
	`state` enum('draft','sent','purchase','done','cancelled') DEFAULT 'draft',
	`subtotal` decimal(15,2) DEFAULT '0',
	`tax_total` decimal(15,2) DEFAULT '0',
	`total` decimal(15,2) DEFAULT '0',
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_orders_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_shift_id_shifts_id_fk` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_enhancer_users_id_fk` FOREIGN KEY (`enhancer`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_salaries` ADD CONSTRAINT `employee_salaries_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_comments` ADD CONSTRAINT `task_comments_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_comments` ADD CONSTRAINT `task_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `positions` ADD CONSTRAINT `positions_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schools` ADD CONSTRAINT `schools_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `units` ADD CONSTRAINT `units_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shift_schedules` ADD CONSTRAINT `shift_schedules_shift_id_shifts_id_fk` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `presences` ADD CONSTRAINT `presences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `presences` ADD CONSTRAINT `presences_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `presences` ADD CONSTRAINT `presences_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `presences` ADD CONSTRAINT `presences_enhancer_users_id_fk` FOREIGN KEY (`enhancer`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stages` ADD CONSTRAINT `stages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `settings` ADD CONSTRAINT `settings_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_users` ADD CONSTRAINT `project_users_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_users` ADD CONSTRAINT `project_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_columns` ADD CONSTRAINT `project_columns_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_column_id_project_columns_id_fk` FOREIGN KEY (`column_id`) REFERENCES `project_columns`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigned_to_users_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_activities` ADD CONSTRAINT `task_activities_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_activities` ADD CONSTRAINT `task_activities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `news` ADD CONSTRAINT `news_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taggables` ADD CONSTRAINT `taggables_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_applicants` ADD CONSTRAINT `job_applicants_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_payments` ADD CONSTRAINT `invoice_payments_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timesheets` ADD CONSTRAINT `timesheets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timesheets` ADD CONSTRAINT `timesheets_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timesheets` ADD CONSTRAINT `timesheets_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payroll_batches` ADD CONSTRAINT `payroll_batches_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_batch_id_payroll_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `payroll_batches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payroll_payment_logs` ADD CONSTRAINT `payroll_payment_logs_payroll_id_payrolls_id_fk` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_salary_components` ADD CONSTRAINT `employee_salary_components_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_salary_components` ADD CONSTRAINT `employee_salary_components_component_id_salary_components_id_fk` FOREIGN KEY (`component_id`) REFERENCES `salary_components`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salary_components` ADD CONSTRAINT `salary_components_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `devices` ADD CONSTRAINT `devices_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_accounts` ADD CONSTRAINT `accounting_accounts_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journals` ADD CONSTRAINT `accounting_journals_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journals` ADD CONSTRAINT `accounting_journals_default_account_id_accounting_accounts_id_fk` FOREIGN KEY (`default_account_id`) REFERENCES `accounting_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journal_entries` ADD CONSTRAINT `accounting_journal_entries_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journal_entries` ADD CONSTRAINT `accounting_journal_entries_journal_id_accounting_journals_id_fk` FOREIGN KEY (`journal_id`) REFERENCES `accounting_journals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journal_items` ADD CONSTRAINT `accounting_journal_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journal_items` ADD CONSTRAINT `accounting_journal_items_account_id_accounting_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounting_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounting_journal_items` ADD CONSTRAINT `fk_journal_items_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `accounting_journal_entries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_locations` ADD CONSTRAINT `inventory_locations_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_locations` ADD CONSTRAINT `inventory_locations_warehouse_id_inventory_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `inventory_warehouses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_warehouses` ADD CONSTRAINT `inventory_warehouses_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_product_categories` ADD CONSTRAINT `inventory_product_categories_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_products` ADD CONSTRAINT `inventory_products_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_products` ADD CONSTRAINT `inventory_products_income_account_id_accounting_accounts_id_fk` FOREIGN KEY (`income_account_id`) REFERENCES `accounting_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_products` ADD CONSTRAINT `inventory_products_expense_account_id_accounting_accounts_id_fk` FOREIGN KEY (`expense_account_id`) REFERENCES `accounting_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_products` ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `inventory_product_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_moves` ADD CONSTRAINT `inventory_stock_moves_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_moves` ADD CONSTRAINT `inventory_stock_moves_product_id_inventory_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `inventory_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_moves` ADD CONSTRAINT `inventory_stock_moves_location_id_inventory_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_moves` ADD CONSTRAINT `inventory_stock_moves_location_dest_id_inventory_locations_id_fk` FOREIGN KEY (`location_dest_id`) REFERENCES `inventory_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_quants` ADD CONSTRAINT `inventory_stock_quants_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_quants` ADD CONSTRAINT `inventory_stock_quants_product_id_inventory_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `inventory_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_stock_quants` ADD CONSTRAINT `inventory_stock_quants_location_id_inventory_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD CONSTRAINT `crm_leads_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD CONSTRAINT `crm_leads_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD CONSTRAINT `crm_leads_salesperson_id_users_id_fk` FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_order_lines` ADD CONSTRAINT `crm_sales_order_lines_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_order_lines` ADD CONSTRAINT `crm_sales_order_lines_order_id_crm_sales_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `crm_sales_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_order_lines` ADD CONSTRAINT `crm_sales_order_lines_product_id_inventory_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `inventory_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD CONSTRAINT `crm_sales_orders_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD CONSTRAINT `crm_sales_orders_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD CONSTRAINT `crm_sales_orders_salesperson_id_users_id_fk` FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_orders` ADD CONSTRAINT `crm_sales_orders_lead_id_crm_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `crm_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_order_lines` ADD CONSTRAINT `purchase_order_lines_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_order_lines` ADD CONSTRAINT `purchase_order_lines_order_id_purchase_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_order_lines` ADD CONSTRAINT `purchase_order_lines_product_id_inventory_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `inventory_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplier_id_clients_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_warehouse_id_inventory_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `inventory_warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_banks_code` ON `banks` (`code`);--> statement-breakpoint
CREATE INDEX `idx_religions_name` ON `religions` (`name`);--> statement-breakpoint
CREATE INDEX `idx_users_role_id` ON `users` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_task_comments_task` ON `task_comments` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_task_comments_user` ON `task_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_documents_owner` ON `documents` (`owner_type`,`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_client_id` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `idx_projects_start_date` ON `projects` (`start_date`);--> statement-breakpoint
CREATE INDEX `idx_projects_due_date` ON `projects` (`due_date`);--> statement-breakpoint
CREATE INDEX `idx_project_users_user_id` ON `project_users` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project_id` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_parent_id` ON `tasks` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_column_id` ON `tasks` (`column_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_assigned_to` ON `tasks` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `idx_tasks_priority` ON `tasks` (`priority`);--> statement-breakpoint
CREATE INDEX `idx_tasks_deadline` ON `tasks` (`deadline`);--> statement-breakpoint
CREATE INDEX `idx_attachments_owner` ON `attachments` (`owner_id`,`owner_type`);--> statement-breakpoint
CREATE INDEX `idx_comments_id` ON `comments` (`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_jobs_slug` ON `jobs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_job_applicants_job_id` ON `job_applicants` (`job_id`);--> statement-breakpoint
CREATE INDEX `idx_job_applicants_email` ON `job_applicants` (`email`);--> statement-breakpoint
CREATE INDEX `idx_invoices_client` ON `invoices` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_invoices_project` ON `invoices` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_invoices_status` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_invoices_date` ON `invoices` (`issue_date`);--> statement-breakpoint
CREATE INDEX `idx_expenses_project` ON `expenses` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_user` ON `expenses` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_status` ON `expenses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_expenses_date` ON `expenses` (`date`);--> statement-breakpoint
CREATE INDEX `idx_timesheets_user` ON `timesheets` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_timesheets_date` ON `timesheets` (`date`);--> statement-breakpoint
CREATE INDEX `idx_timesheets_project` ON `timesheets` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_leaves_user` ON `leave_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_leaves_status` ON `leave_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_leaves_dates` ON `leave_requests` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `idx_journal_items_account` ON `accounting_journal_items` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_journal_items_entry` ON `accounting_journal_items` (`journal_entry_id`);--> statement-breakpoint
CREATE INDEX `idx_journal_items_date` ON `accounting_journal_items` (`date`);--> statement-breakpoint
CREATE INDEX `idx_products_code` ON `inventory_products` (`code`);--> statement-breakpoint
CREATE INDEX `idx_stock_moves_product` ON `inventory_stock_moves` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_moves_location` ON `inventory_stock_moves` (`location_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_moves_location_dest` ON `inventory_stock_moves` (`location_dest_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_quants_product_location` ON `inventory_stock_quants` (`product_id`,`location_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_salesperson` ON `crm_leads` (`salesperson_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_stage` ON `crm_leads` (`stage`);--> statement-breakpoint
CREATE INDEX `idx_sales_orders_client` ON `crm_sales_orders` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_orders_date` ON `crm_sales_orders` (`date`);--> statement-breakpoint
CREATE INDEX `idx_purchase_orders_supplier` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_orders_date` ON `purchase_orders` (`date`);