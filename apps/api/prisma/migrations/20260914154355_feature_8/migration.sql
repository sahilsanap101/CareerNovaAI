-- CreateTable
CREATE TABLE "gate_revision_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "mistakeId" TEXT,
    "practiceAttemptId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastReviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_revision_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_revision_items_userId_idx" ON "gate_revision_items"("userId");

-- CreateIndex
CREATE INDEX "gate_revision_items_scheduledDate_idx" ON "gate_revision_items"("scheduledDate");

-- CreateIndex
CREATE INDEX "gate_revision_items_topicId_idx" ON "gate_revision_items"("topicId");

-- CreateIndex
CREATE INDEX "gate_revision_items_mistakeId_idx" ON "gate_revision_items"("mistakeId");

-- CreateIndex
CREATE INDEX "gate_revision_items_practiceAttemptId_idx" ON "gate_revision_items"("practiceAttemptId");

-- AddForeignKey
ALTER TABLE "gate_revision_items" ADD CONSTRAINT "gate_revision_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_revision_items" ADD CONSTRAINT "gate_revision_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "gate_personal_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_revision_items" ADD CONSTRAINT "gate_revision_items_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "gate_mistakes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_revision_items" ADD CONSTRAINT "gate_revision_items_practiceAttemptId_fkey" FOREIGN KEY ("practiceAttemptId") REFERENCES "gate_practice_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
