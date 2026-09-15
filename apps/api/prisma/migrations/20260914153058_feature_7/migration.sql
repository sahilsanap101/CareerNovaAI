-- CreateTable
CREATE TABLE "gate_mistakes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "practiceAttemptId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "correctConcept" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "difficulty" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "needsRevision" BOOLEAN NOT NULL DEFAULT true,
    "mistakeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_mistakes_userId_idx" ON "gate_mistakes"("userId");

-- CreateIndex
CREATE INDEX "gate_mistakes_topicId_idx" ON "gate_mistakes"("topicId");

-- CreateIndex
CREATE INDEX "gate_mistakes_practiceAttemptId_idx" ON "gate_mistakes"("practiceAttemptId");

-- CreateIndex
CREATE INDEX "gate_mistakes_status_idx" ON "gate_mistakes"("status");

-- AddForeignKey
ALTER TABLE "gate_mistakes" ADD CONSTRAINT "gate_mistakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_mistakes" ADD CONSTRAINT "gate_mistakes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "gate_personal_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_mistakes" ADD CONSTRAINT "gate_mistakes_practiceAttemptId_fkey" FOREIGN KEY ("practiceAttemptId") REFERENCES "gate_practice_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
