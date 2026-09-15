-- CreateTable
CREATE TABLE "gate_study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "studyTaskId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL DEFAULT 'STUDY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_study_sessions_userId_idx" ON "gate_study_sessions"("userId");

-- CreateIndex
CREATE INDEX "gate_study_sessions_userId_startedAt_idx" ON "gate_study_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "gate_study_sessions_topicId_idx" ON "gate_study_sessions"("topicId");

-- CreateIndex
CREATE INDEX "gate_study_sessions_studyTaskId_idx" ON "gate_study_sessions"("studyTaskId");

-- AddForeignKey
ALTER TABLE "gate_study_sessions" ADD CONSTRAINT "gate_study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_study_sessions" ADD CONSTRAINT "gate_study_sessions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "gate_personal_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_study_sessions" ADD CONSTRAINT "gate_study_sessions_studyTaskId_fkey" FOREIGN KEY ("studyTaskId") REFERENCES "gate_study_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
