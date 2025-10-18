/*
  Warnings:

  - The values [PIGGY_BANK] on the enum `attachments_attachable_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PIGGY_BANK] on the enum `notes_noteable_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `piggy_bank_id` on the `recurrence_transactions` table. All the data in the column will be lost.
  - You are about to drop the `piggy_bank_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `piggy_banks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachment_piggybank_fk`;

-- DropForeignKey
ALTER TABLE `notes` DROP FOREIGN KEY `note_piggybank_fk`;

-- DropForeignKey
ALTER TABLE `piggy_bank_events` DROP FOREIGN KEY `piggy_bank_events_piggy_bank_id_fkey`;

-- DropForeignKey
ALTER TABLE `piggy_bank_events` DROP FOREIGN KEY `piggy_bank_events_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `piggy_banks` DROP FOREIGN KEY `piggy_banks_account_id_fkey`;

-- DropForeignKey
ALTER TABLE `piggy_banks` DROP FOREIGN KEY `piggy_banks_object_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `piggy_banks` DROP FOREIGN KEY `piggy_banks_user_id_fkey`;

-- AlterTable
ALTER TABLE `attachments` MODIFY `attachable_type` ENUM('TRANSACTION', 'BILL', 'BUDGET', 'CATEGORY', 'TAG', 'RECURRENCE') NOT NULL;

-- AlterTable
ALTER TABLE `notes` MODIFY `noteable_type` ENUM('TRANSACTION', 'BILL', 'BUDGET', 'CATEGORY', 'RECURRENCE') NOT NULL;

-- AlterTable
ALTER TABLE `recurrence_transactions` DROP COLUMN `piggy_bank_id`;

-- DropTable
DROP TABLE `piggy_bank_events`;

-- DropTable
DROP TABLE `piggy_banks`;
