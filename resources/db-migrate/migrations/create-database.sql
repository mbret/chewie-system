CREATE TABLE `info` (
  `key` VARCHAR(255),
  `value` VARCHAR(255)
);
CREATE TABLE `user` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `role` TEXT NOT NULL DEFAULT 'user',
  `profileImage` VARCHAR(255) DEFAULT NULL,
  `config` JSON DEFAULT '{}',
  `createdAt` INTEGER NOT NULL,
  `updatedAt` INTEGER
);
CREATE TABLE `task` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `moduleId` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) DEFAULT '',
  `options` JSON DEFAULT '{}',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `userId` INTEGER REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, UNIQUE (name));
CREATE TABLE `scenario` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `deviceId` VARCHAR(255) NOT NULL,
  `pluginId` VARCHAR(255) DEFAULT NULL,
  `moduleId` VARCHAR(255) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT '',
  `nodes` VARCHAR(255) DEFAULT '{}',
  `autoStart` SMALLINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE (name)
);
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
CREATE TABLE `hookData` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `deviceId` VARCHAR(255) NOT NULL,
  `hookName` VARCHAR(255),
  `key` VARCHAR(255),
  `data` VARCHAR(255) DEFAULT '{}',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);
CREATE TABLE `hookOption` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `deviceId` VARCHAR(255) NOT NULL,
  `hookName` VARCHAR(255),
  `data` VARCHAR(255) DEFAULT '{}',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);
CREATE TABLE `systemConfig` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `deviceId` VARCHAR(255) NOT NULL,
  `data` VARCHAR(255) DEFAULT '{}',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
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