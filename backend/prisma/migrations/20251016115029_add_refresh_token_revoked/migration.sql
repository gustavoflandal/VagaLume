-- AlterTable
ALTER TABLE `refresh_tokens` ADD COLUMN `is_revoked` BOOLEAN NOT NULL DEFAULT false;
