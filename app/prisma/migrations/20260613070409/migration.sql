/*
  Warnings:

  - Changed the type of `fieldName` on the `comment_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fieldName` on the `issue_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fieldName` on the `project_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "HistoryField" AS ENUM ('TITLE', 'DESCRIPTION', 'STATUS', 'PRIORITY', 'ASSIGNEE', 'DUE_DATE', 'CONTENT', 'DELETED_AT');

-- AlterTable
ALTER TABLE "comment_histories" DROP COLUMN "fieldName",
ADD COLUMN     "fieldName" "HistoryField" NOT NULL;

-- AlterTable
ALTER TABLE "issue_histories" DROP COLUMN "fieldName",
ADD COLUMN     "fieldName" "HistoryField" NOT NULL;

-- AlterTable
ALTER TABLE "project_histories" DROP COLUMN "fieldName",
ADD COLUMN     "fieldName" "HistoryField" NOT NULL;
