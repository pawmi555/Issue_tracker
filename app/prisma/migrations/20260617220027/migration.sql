/*
  Warnings:

  - The values [NAME,DESCRIPTION,TITLE,STATUS_ID,PRIORITY_ID,ASSIGNEE_ID,DUE_DATE,DELETED_AT,CONTENT] on the enum `HistoryField` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HistoryField_new" AS ENUM ('USER_NAME', 'USER_EMAIL', 'USER_ROLE', 'PROJECT_NAME', 'PROJECT_DESCRIPTION', 'ISSUE_TITLE', 'ISSUE_DESCRIPTION', 'ISSUE_STATUS_ID', 'ISSUE_PRIORITY_ID', 'ISSUE_ASSIGNEE_ID', 'ISSUE_DUE_DATE', 'ISSUE_DELETED_AT', 'COMMENT_CONTENT');
ALTER TABLE "user_histories" ALTER COLUMN "fieldName" TYPE "HistoryField_new" USING ("fieldName"::text::"HistoryField_new");
ALTER TABLE "project_histories" ALTER COLUMN "fieldName" TYPE "HistoryField_new" USING ("fieldName"::text::"HistoryField_new");
ALTER TABLE "issue_histories" ALTER COLUMN "fieldName" TYPE "HistoryField_new" USING ("fieldName"::text::"HistoryField_new");
ALTER TABLE "comment_histories" ALTER COLUMN "fieldName" TYPE "HistoryField_new" USING ("fieldName"::text::"HistoryField_new");
ALTER TYPE "HistoryField" RENAME TO "HistoryField_old";
ALTER TYPE "HistoryField_new" RENAME TO "HistoryField";
DROP TYPE "public"."HistoryField_old";
COMMIT;
