-- CreateTable
CREATE TABLE "user_histories" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "operatedBy" INTEGER NOT NULL,
    "actionId" INTEGER NOT NULL,
    "fieldName" "HistoryField" NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_histories_userId_createdAt_idx" ON "user_histories"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_histories_operatedBy_createdAt_idx" ON "user_histories"("operatedBy", "createdAt");

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_operatedBy_fkey" FOREIGN KEY ("operatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_histories" ADD CONSTRAINT "user_histories_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "history_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
