/*
  Warnings:

  - Added the required column `storage_key` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "storage_key" TEXT NOT NULL;
