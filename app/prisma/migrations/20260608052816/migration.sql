/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `api_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "api_logs" ADD COLUMN     "requestId" TEXT;

-- CreateTable
CREATE TABLE "comment_histories" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_histories_commentId_createdAt_idx" ON "comment_histories"("commentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_logs_requestId_key" ON "api_logs"("requestId");

-- AddForeignKey
ALTER TABLE "comment_histories" ADD CONSTRAINT "comment_histories_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_histories" ADD CONSTRAINT "comment_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
