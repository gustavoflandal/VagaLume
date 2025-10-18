/*
  Warnings:

  - You are about to drop the column `amount_max` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `amount_min` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `auto_match` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `extension_date` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `skip` on the `bills` table. All the data in the column will be lost.
  - Added the required column `amount` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number_of_installments` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bills` DROP COLUMN `amount_max`,
    DROP COLUMN `amount_min`,
    DROP COLUMN `auto_match`,
    DROP COLUMN `end_date`,
    DROP COLUMN `extension_date`,
    DROP COLUMN `skip`,
    ADD COLUMN `account_id` VARCHAR(191) NULL,
    ADD COLUMN `amount` DECIMAL(15, 2) NOT NULL,
    ADD COLUMN `category_id` VARCHAR(191) NULL,
    ADD COLUMN `is_fixed_day` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `number_of_installments` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `bill_installments` (
    `id` VARCHAR(191) NOT NULL,
    `bill_id` VARCHAR(191) NOT NULL,
    `installment_sequence` INTEGER NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `amount_paid` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `paid_at` DATETIME(3) NULL,
    `transaction_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bill_installments_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_installments` ADD CONSTRAINT `bill_installments_bill_id_fkey` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_installments` ADD CONSTRAINT `bill_installments_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
