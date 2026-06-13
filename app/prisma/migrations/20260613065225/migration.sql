/*
  Warnings:

  - Added the required column `actionId` to the `comment_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionId` to the `issue_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionId` to the `project_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment_histories" ADD COLUMN     "actionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "issue_histories" ADD COLUMN     "actionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "project_histories" ADD COLUMN     "actionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "history_actions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "history_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "history_actions_name_key" ON "history_actions"("name");

-- AddForeignKey
ALTER TABLE "project_histories" ADD CONSTRAINT "project_histories_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "history_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_histories" ADD CONSTRAINT "issue_histories_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "history_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_histories" ADD CONSTRAINT "comment_histories_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "history_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
