/*
  Warnings:

  - You are about to drop the column `locaked_amount` on the `Worker` table. All the data in the column will be lost.
  - Added the required column `locked_amount` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "locaked_amount",
ADD COLUMN     "locked_amount" INTEGER NOT NULL;
