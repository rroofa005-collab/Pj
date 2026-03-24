CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_key_unique` ON `app_settings` (`key`);--> statement-breakpoint
CREATE TABLE `customer_debts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`service_or_product` text,
	`total_amount` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`remaining_amount` real DEFAULT 0 NOT NULL,
	`due_date` text,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `delivery_tracking` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `electronic_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`received_dollar` real DEFAULT 0 NOT NULL,
	`remaining_dollar` real DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`service_type` text,
	`amount_dollar` real DEFAULT 0 NOT NULL,
	`amount_dinar` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'paid' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`worker_id` integer,
	`worker_name` text,
	`nature` text,
	`amount` real DEFAULT 0 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone_type` text,
	`fault` text,
	`parts_cost` real DEFAULT 0 NOT NULL,
	`labor_cost` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`due_amount` real DEFAULT 0 NOT NULL,
	`net_profit` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'in_maintenance' NOT NULL,
	`status_note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`product` text,
	`total_amount_no_delivery` real DEFAULT 0 NOT NULL,
	`wilaya` text,
	`order_status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `purchased_phones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`phone_type` text,
	`phone_details` text,
	`serial_number` text,
	`phone_condition` text,
	`purchase_amount` real DEFAULT 0 NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `received_amounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nature` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `salaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`worker_id` integer,
	`worker_name` text,
	`base_salary` real DEFAULT 0 NOT NULL,
	`bonuses` real DEFAULT 0 NOT NULL,
	`penalties` real DEFAULT 0 NOT NULL,
	`net_salary` real DEFAULT 0 NOT NULL,
	`payment_date` text,
	`created_at` integer,
	FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_debts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`product` text,
	`total_amount` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`remaining_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`service_type` text,
	`phone` text,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `treasury` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`program_balance` real DEFAULT 0 NOT NULL,
	`actual_balance` real DEFAULT 0 NOT NULL,
	`expenses` real DEFAULT 0 NOT NULL,
	`purchases` real DEFAULT 0 NOT NULL,
	`customer_debts` real DEFAULT 0 NOT NULL,
	`received_amounts` real DEFAULT 0 NOT NULL,
	`wages` real DEFAULT 0 NOT NULL,
	`installments` real DEFAULT 0 NOT NULL,
	`flexi` real DEFAULT 0 NOT NULL,
	`maintenance` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `workers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`salary` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer
);
