CREATE TABLE `user` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `username` VARCHAR(255) NOT NULL UNIQUE, `firstName` VARCHAR(255), `lastName` VARCHAR(255), `role` TEXT NOT NULL DEFAULT 'user', `profileImage` VARCHAR(255) DEFAULT NULL, `config` JSON DEFAULT '{"externalServices":{"google":{"auth":{"clientId":null,"clientSecret":null},"accessToken":null,"refreshToken":null}},"foo":"bar","screens":[{"id":"4a5100f7-ab69-4dd9-b465-416d3ee04aae","name":"Default","description":"This is your first screen"}]}', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, UNIQUE (username));
CREATE TABLE `task` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` VARCHAR(255) NOT NULL UNIQUE, `moduleId` VARCHAR(255) NOT NULL, `description` VARCHAR(255) DEFAULT '', `options` JSON DEFAULT '{}', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `userId` INTEGER REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, UNIQUE (name));
CREATE TABLE `scenario` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `deviceId` VARCHAR(255) NOT NULL, `name` VARCHAR(255) NOT NULL UNIQUE, `description` VARCHAR(255) DEFAULT '', `nodes` VARCHAR(255) DEFAULT '{}', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, UNIQUE (name));
CREATE TABLE `plugins` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `deviceId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) UNIQUE,
  `version` VARCHAR(255),
  `repository` TEXT NOT NULL,
  `source` VARCHAR(255),
  `userOptions` VARCHAR(255) DEFAULT '{}',
  `package` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL, UNIQUE (name)
);
CREATE TABLE `notification` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `userId` INTEGER DEFAULT NULL,
  `type` TEXT NOT NULL,
  `from` VARCHAR(255) DEFAULT NULL,
  `content` VARCHAR(255) NOT NULL,
  `options` VARCHAR(255) DEFAULT '{}',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);
CREATE TABLE `logs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `level` VARCHAR(255),
  `message` VARCHAR(255),
  `meta` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);