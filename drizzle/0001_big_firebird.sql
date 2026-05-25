CREATE TABLE `readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('tarot','ziwei','fortune') NOT NULL,
	`question` text,
	`inputData` text,
	`interpretation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treehole_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`mood` varchar(32),
	`userText` text NOT NULL,
	`aiResponse` text,
	`crystalName` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `treehole_sessions_id` PRIMARY KEY(`id`)
);
