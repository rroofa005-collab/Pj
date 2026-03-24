ALTER TABLE `users` ADD `worker_id` integer;--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`username` text,
	`worker_id` integer,
	`worker_name` text,
	`check_in` integer,
	`check_out` integer,
	`work_hours` real DEFAULT 0,
	`date` text,
	`note` text
);
