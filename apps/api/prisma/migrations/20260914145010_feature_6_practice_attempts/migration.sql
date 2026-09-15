-- CreateTable
CREATE TABLE "gate_practice_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "attemptType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "paperCode" TEXT,
    "paperYear" INTEGER,
    "attemptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalQuestions" INTEGER NOT NULL,
    "attemptedQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    "unattemptedQuestions" INTEGER NOT NULL,
    "marksObtained" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "difficulty" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_practice_attempts_userId_idx" ON "gate_practice_attempts"("userId");

-- CreateIndex
CREATE INDEX "gate_practice_attempts_userId_attemptDate_idx" ON "gate_practice_attempts"("userId", "attemptDate");

-- CreateIndex
CREATE INDEX "gate_practice_attempts_topicId_idx" ON "gate_practice_attempts"("topicId");

-- CreateIndex
CREATE INDEX "gate_practice_attempts_attemptType_idx" ON "gate_practice_attempts"("attemptType");

-- AddForeignKey
ALTER TABLE "gate_practice_attempts" ADD CONSTRAINT "gate_practice_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_practice_attempts" ADD CONSTRAINT "gate_practice_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "gate_personal_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
