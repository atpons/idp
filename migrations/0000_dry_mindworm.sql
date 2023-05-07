CREATE TABLE `tests` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE `webauthn_credentials` (
	`public_key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE UNIQUE INDEX `idIdx` ON `users` (`id`);
CREATE UNIQUE INDEX `user_id_idx` ON `webauthn_credentials` (`user_id`);